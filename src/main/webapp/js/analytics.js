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
            return cookieValue;


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
            this.set(key, value, new Date().getTime() + 315360000000, "/");
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
        cookieExpires: 315360000000,

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
            title: "tt",
            orderId: "oid",
            orderName: "on",
            currencyAmount: "cua",
            currencyType: "cut",
            paymentType: "pt",
            category: "ca",
            action: "ac",
            kv: "kv_",
            duration: "du"

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
         * 获取会话id
         * @returns {*}
         */
        getSid: function () {
            return CookieUtil.get(this.keys.sid);
        },

        /**
         * 保存会话id到Cookie
         * @param sid
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
            } else {
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
         * 设置会员id
         * @param mid
         */
        setMemberId: function (mid) {
            if (mid) {
                CookieUtil.setExt(this.keys.mid, mid);
            }
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
            if (this.preCallApi()) {
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
         * @param orderId 订单id
         * @param orderName 产品购买描述名称
         * @param currencyAmount 产品价格
         * @param currencyType 货币类型
         * @param paymentType 支付方式
         */
        onChargeRequest: function (orderId, orderName, currencyAmount, currencyType, paymentType) {
            if (this.preCallApi()) {

                //判断订单id、货币类型以及支付方式是否为空
                if (!orderId || !currencyType || !paymentType) {
                    this.log("订单id、货币类型以及支付方式不能为空！");
                    return;
                }

                //判断产品价格是否是数字(负数呢？)
                if (!typeof (currencyAmount) == "number") {
                    this.log("产品价格必须是数字！");
                    return;
                }

                var time = new Date().getTime();
                var chargeRequestEvent = {};
                //设置事件名称
                chargeRequestEvent[this.columns.eventName] = this.keys.chargeRequestEvent;
                //设置订单id
                chargeRequestEvent[this.columns.orderId] = orderId;
                //设置产品购买描述名称
                chargeRequestEvent[this.columns.orderName] = orderName;
                //设置产品价格
                chargeRequestEvent[this.columns.currencyAmount] = currencyAmount;
                //设置货币类型
                chargeRequestEvent[this.columns.currencyType] = currencyType;
                //设置支付方式
                chargeRequestEvent[this.columns.paymentType] = paymentType;
                //设置公用columns
                this.setCommonColumns(chargeRequestEvent);
                //最终发送编码后的数据
                this.sendDataToServer(this.parseParam(chargeRequestEvent));
                //更新最近操作时间
                this.updatePreVisitTime(time);
            }
        },

        /**
         * 触发Event事件
         * @param category 自定义事件名称
         * @param action 自定义事件动作
         * @param map 其他参数
         * @param duration 事件持续时间
         */
        onEventDuration: function (category, action, map, duration) {
            if (this.preCallApi()) {
                //判断事件名称和事件动作是否为空
                if (!category || !action) {
                    this.log("事件名称和事件动作不能为空");
                    return;
                }

                var time = new Date().getTime();
                var event = {};
                //设置事件名称
                event[this.columns.eventName] = this.keys.eventDurationEvent;
                //设置自定义事件名称
                event[this.columns.category] = category;
                //设置自定义事件动作
                event[this.columns.action] = action;
                //判断map是否有值
                if (map) {
                    for (var k in map) {
                        //只有在key和value都不为空的情况下，才能写入相关属性
                        if (k && map[k]) {
                            event[this.columns.kv + k] = map[k];
                        }
                    }
                }
                //判断duration是否有值，有值就设置持续时间
                if (duration) {
                    event[this.columns.duration] = duration;
                }
                //设置公用columns
                this.setCommonColumns(event);
                //最终发送编码后的数据
                this.sendDataToServer(this.parseParam(event));
                //更新最近操作时间
                this.updatePreVisitTime(time);
            }
        },

        /**
         * 执行对外方法前必须执行的方法
         * @returns {boolean}
         */
        preCallApi: function () {
            if (this.isSessionTimeout()) {
                //超时，需要进行新建会话
                this.startSession();
            } else {
                //没超时，只需要更新前一次访问时间
                this.updatePreVisitTime(new Date().getTime());
            }
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
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            var tmpid = [];
            var r;
            tmpid[8] = tmpid[13] = tmpid[18] = tmpid[23] = '-';
            tmpid[14] = '4';

            //var uuid = '';
            for (var i = 0; i < 36; i++) {
                if (!tmpid[i]) {
                    r = 0 | Math.random() * 16;
                    tmpid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
                //uuid += tmpid[i];
            }
            return tmpid.join('');
            //return uuid;
        },

        /**
         * 判断会话是否过期
         * 查看当前时间和最近访问时间时间间隔是否小于this.clientConfig.sessionTimeout
         * 如果小于，则返回false，否则返回true
         * @returns {boolean}
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
         * @param time
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
        },

        /**
         * 打印日志
         * @param msg
         */
        log: function (msg) {
            console.log(msg);
        }

    };

    /**
     * 对外暴露的方法名称
     * @type {{startSession: Window.__AE__.startSession}}
     * @private
     */
    window.__AE__ = {
        
        startSession: function () {
            tracker.startSession();
        },
        onPageView: function () {
            tracker.onPageView();
        },
        onChargeRequest: function (orderId, orderName, currencyAmount, currencyType, paymentType) {
            tracker.onChargeRequest(orderId, orderName, currencyAmount, currencyType, paymentType);
        },
        onEventDuration: function (category, action, map, duration) {
            tracker.onEventDuration(category, action, map, duration);
        },
        setMemberId: function (mid) {
            tracker.setMemberId(mid);
        }

    }

    /**
     * 自动加载方法
     */
    var autoLoad = function () {
        //进行参数设置
        var _aelog_ = _aelog_ || window._aelog_ || [];
        var memberId = null;
        for(var i = 0; i < _aelog_.length; i++){
            _aelog_[i][0] === "memberId" && (memberId = _aelog_[i][1]);
        }

        //根据给定的memberId，设置memberId的值
        memberId && __AE__.setMemberId(memberId);
        //启动session
        __AE__.startSession();
    };

    //手动进行加载
    autoLoad();
})();
