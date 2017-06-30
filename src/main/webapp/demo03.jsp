<%--
  Created by IntelliJ IDEA.
  User: Administrator
  Date: 2017/6/30
  Time: 13:42
  To change this template use File | Settings | File Templates.
--%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <title>测试onEventDuration事件</title>
    <script type="text/javascript" src="./js/analytics.js"></script>
</head>
<body>
demo03
<br/>
<label>category: event的category名称</label><br/>
<label>action: event的action名称</label><br/>
<label>map: {"key1":"value1", "key2":"value2"}</label><br/>
<label>duration: 1245</label><br/>
<button onclick="__AE__.onEventDuration('event的category名称','event的action名称', {'key1':'value1','key2':'value2'}, 1245)">
    触发带map和duration的事件
</button>
<br/>
<button onclick="__AE__.onEventDuration('event的category名称','event的action名称')">触发不带map和duration的事件</button>
<br/>
跳转到:
<a href="demo01.jsp">demo01</a>
<a href="demo02.jsp">demo02</a>
<a href="demo03.jsp">demo03</a>
<a href="demo04.jsp">demo04</a>
</body>
</html>
