/**
 * Created by Administrator on 2017/6/29.
 */
(function () {
    var CookieUtil = {
        /**
         * 获取key为name的Cookie
         */
        get: function (key) {
            var cookieName = encodeURIComponent(key) + "=",
                cookieStart = document.cookie.indexOf(cookieName),
                cookieValue = null;

            if (cookieStart > -1) {
                var cookieEnd = document.cookie.indexOf(";", cookieStart);
                if (cookieEnd == -1) {
                    cookieEnd = document.cookie.length;
                }
                cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd))
            }


        },
        /**
         * 设置Cookie的key/value对
         */
        set: function (key, value, expires, path, domain, secure) {
            var cookieText = encodeURIComponent(key) + "=" + encodeURIComponent(value);

            // 设置Cookie过期时间
            if (expires) {
                var expiresTime = new Date();
                expiresTime.setTime(expires);
                cookieText += ";expires=" + expiresTime.toUTCString();
            }

            //设置Cookie的存储路径
            if (path) {
                cookieText += ";path=" + path;
            }

            //设置Cookie的所属域
            if (domain) {
                cookieText += ";domain=" + domain;
            }

            if (secure) {
                cookieText += ";secure";
            }

            document.cookie = cookieText;

        },

        setExt: function (key, value) {
            this.set(key, value, new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000, "/");
        }

    };

    /**
     * 主体，其实就是tracker js
     */
    var tracker = {

        /**
         * 定义常量用
         */
        clientConfig: {
            serverUrl: "http://hadoop/BfImg.gif", //请求url
            sessionTimeout: 360, //session过期时间
            maxWaitTime: 3600, //最大等待时间，设置为1h
            ver: "1"
        },

        /**
         * cookie过期时间，设置为十年
         */
        cookieExpires: 10 * 365 * 24 * 60 * 60 * 1000,

        /**
         * 发送到服务器的列名
         */
        columns: {
            eventName: "en",
            version: "ver",
            platform: "pl",
            sdk: "sdk",
            uuid: "u_uid",
            memberId: "u_mid",
            sessionId: "u_sid",
            clientTime: "c_time",
            language: "l",
            userAgent: "b_iev",
            resolution: "b_rst",
            currentUrl: "p_url",
            referenceUrl: "p_ref",
            title: "tt"

        },

        keys: {
            pageView: "e_pv",
            chargeRequestEvent: "e_cre",
            launch: "e_1",
            eventDurationEvent: "ede",
            sid: "bftrack_sid",
            uuid: "bftrack_uuid",
            mid: "bftrack_mid",
            preVisitTime: "bftrack_previsit"
        },

        /**
         * 返回全部event的名称数组
         */
        getEventKeys: function () {

            return [
                this.keys.pageView,
                this.keys.chargeRequestEvent,
                this.keys.launch,
                this.keys.eventDurationEvent
            ];

        },

        /**
         * 获取会话id
         * @returns {*}
         */
        getSid: function () {
            return CookieUtil.get(this.keys.sid);
        },

        /**
         * 保存会话id到Cookie
         */
        setSid: function (sid) {
            if (sid) {
                CookieUtil.setExt(this.keys.sid, sid);
            }
        },

        /**
         * 参数编码
         * @param data
         * @returns {*} 返回字符串
         */
        parseParam: function (data) {
            var params = "";
            for (var e in data) {
                if (e && data[e]) {
                    params += encodeURIComponent(e) + "=" + encodeURIComponent(data[e]) + "&";
                }
            }
            if (params) {
                //params非空
                return params.substring(0, params.length - 1);
            }else{
                //params为空
                return params
            }


        },

        /**
         * 从Cookie中获取uuid
         */
        getUuid: function () {
            return CookieUtil.get(this.keys.uuid);
        },

        /**
         * 保存uuid到Cookie
         * @param uuid
         */
        setUuid: function (uuid) {
            if (uuid) {
                CookieUtil.setExt(this.keys.uuid, uuid);
            }
        },

        /**
         * 获取Member ID
         * @returns {*}
         */
        getMemberId: function () {
            return CookieUtil.get(this.keys.mid);
        },

        /**
         * 加载js触发的事件
         */
        startSession: function () {
            //会话id存在，表示uuid也存在
            if (this.getSid()) {

                if (this.isSessionTimeout()) {
                    //会话过期，产生新的会话
                    this.createNewSession();
                } else {
                    //会话，没有过期，更新最近访问时间
                    this.updatePreVisitTime(new Date().getTime());
                }

            } else {
                // 会话id不存在，产生新的会话
                this.createNewSession();
            }
            this.onPageView();
        },

        /**
         * 触发launch事件
         */
        onLaunch: function () {
            var launch = {};
            //设置事件名称
            launch[this.columns.eventName] = this.keys.launch;
            //设置公用columns
            this.setCommonColumns(launch);
            //最终发送编码后的数据
            this.sendDataToServer(this.parseParam(launch));
            //更新最近操作时间
            //this.updatePreVisitTime(new Date().getTime());
        },

        /**
         * 触发页面查看事件
         */
        onPageView: function () {
            if(this.preCallApi()){
                var time = new Date().getTime();
                var pageViewEvent = {};
                pageViewEvent[this.columns.eventName] = this.keys.pageView;
                //设置当前url
                pageViewEvent[this.columns.currentUrl] = window.location.href;
                //设置前一个页面的url
                pageViewEvent[this.columns.referenceUrl] = document.referrer;
                //设置title
                pageViewEvent[this.columns.title] = document.title;
                //设置公用columns
                this.setCommonColumns(pageViewEvent);
                //最终发送编码后的数据
                this.sendDataToServer(this.parseParam(pageViewEvent));
                //更新最近操作时间
                this.updatePreVisitTime(time);

            }
        },

        /**
         * 触发订单产生事件
         */
        onChargeRequest: function () {

        },

        /**
         * 触发Event事件
         */
        onEventDuration: function () {

        },

        /**
         * 执行对外方法前必须执行的方法
         * @returns {boolean}
         */
        preCallApi: function () {
            return true;
        },

        /**
         * 发送data数据到服务器，data是一个Map<String, Object>
         * @param data 是一个字符串
         */
        sendDataToServer: function (data) {
            var that = this;
            var i2 = new Image(1, 1);
            //进行重试操作
            i2.onerror = function () {
                
            }
            i2.src = this.clientConfig.serverUrl + "?" + data;
        },

        /**
         * 在data中添加发送到日志收集服务器的公用部分
         * @param data
         */
        setCommonColumns: function (data) {
            //设置版本
            data[this.columns.version] = this.clientConfig.ver;
            //设置平台
            data[this.columns.platform] = "website";
            //设置sdk
            data[this.columns.sdk] = "js";
            //设置用户id
            data[this.columns.uuid] = this.getUuid();
            //设置会员id
            data[this.columns.memberId] = this.getMemberId();
            //设置Sid
            data[this.columns.sessionId] = this.getSid();
            //设置客户端时间
            data[this.columns.clientTime] = new Date().getTime();
            //设置浏览器语言
            data[this.columns.language] = window.navigator.language;
            //设置浏览器类型
            data[this.columns.userAgent] = window.navigator.userAgent;
            //设置浏览器分辨率
            data[this.columns.resolution] = screen.width + "*" + screen.height;
        },

        /**
         * 产生UUID
         * @returns {string}
         */
        generateId: function () {
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            var tmpid = [];
            var r;
            tmpid[8] = tmpid[13] = tmpid[18] = tmpid[23] = "-";
            tmpid[14] = "4";

            for (var i = 0; i < 36; i++) {
                if (!tmpid[i]) {
                    r = 0 | Math.random() * 16;
                    tmpid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
            return tmpid.join("");
        },

        /**
         * 判断会话是否过期
         * 查看当前时间和最近访问时间时间间隔是否小于this.clientConfig.sessionTimeout
         * 如果小于，则返回false，否则返回true
         */
        isSessionTimeout: function () {
            var time = new Date().getTime();
            var preTime = CookieUtil.get(this.keys.preVisitTime);

            //判断最近访问时间是否存在
            if (preTime) {
                // 存在，则进行区间判断
                return time - preTime > this.clientConfig.sessionTimeout * 1000;
            }

            return true;
        },

        /**
         * 更新最近访问时间
         */
        updatePreVisitTime: function (time) {
            CookieUtil.setExt(this.keys.preVisitTime, time);
        },

        /**
         * 创建新的会话，并判断是否是第一次访问页面，如果是，进行launch事件的发送
         */
        createNewSession: function () {
            // 获取当前时间
            var time = new Date().getTime();

            // 1. 进行会话更新操作
            // 产生一个Session Id
            var sid = this.generateId();
            // 更新会话
            this.setSid(sid);
            //更新最近访问时间
            this.updatePreVisitTime(time);

            // 2. 进行uuid查看操作
            //判断uuid是否存在
            if (!this.getUuid()) {
                //如果不存在，先产生Uuid，然后将它保存到Cookie中，最后触发launch事件
                var uuid = this.generateId();
                this.setUuid(uuid);
                this.onLaunch();
            } else {
                //如果存在，更新会话
            }
        }

    };

    /**
     * 对外的方法
     * @type {{startSession: Window.__AE__.startSession}}
     * @private
     */
    window.__AE__ = {
        /**
         * 加载js触发的事件
         */
        startSession: function () {
            tracker.startSession();
        }
    }

    /**
     * 加载
     */
    var autoLoad = function () {
        __AE__.startSession();
    };

    //手动进行加载
    autoLoad();
})();
