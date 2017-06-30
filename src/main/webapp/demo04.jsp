<%--
  Created by IntelliJ IDEA.
  User: Administrator
  Date: 2017/6/30
  Time: 13:43
  To change this template use File | Settings | File Templates.
--%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <title>测试另外的集成方式</title>
    <script type="text/javascript">
        (function () {
            var _aelog_ = _aelog_ || window._aelog_ || [];
            // 设置_aelog_相关属性
            _aelog_.push(["memberId", "member1234567890"]);
            window._aelog_ = _aelog_;
            (function () {
                var aejs = document.createElement('script');
                aejs.type = 'text/javascript';
                aejs.async = true;
                aejs.src = './js/analytics.js';
                var script = document.getElementsByTagName('script')[0];
                script.parentNode.insertBefore(aejs, script);
            })();
        })();
    </script>
</head>
<body>
demo04
<br/>
在本页面设置memberid为member1234567890<br/>
跳转到:
<a href="demo01.jsp">demo01</a>
<a href="demo02.jsp">demo02</a>
<a href="demo03.jsp">demo03</a>
<a href="demo04.jsp">demo04</a>
</body>
</html>
