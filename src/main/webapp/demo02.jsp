<%--
  Created by IntelliJ IDEA.
  User: Administrator
  Date: 2017/6/30
  Time: 13:38
  To change this template use File | Settings | File Templates.
--%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <title>测试onChargeEvent事件</title>
    <script type="text/javascript" src="./js/analytics.js"></script>
</head>
<body>
demo02
<br/>
<label>orderid: 123456</label><br>
<label>orderName: 测试订单123456</label><br/>
<label>currencyAmount: 524.01</label><br/>
<label>currencyType: RMB</label><br/>
<label>paymentType: alipay</label><br/>
<button onclick="__AE__.onChargeRequest('123456','测试订单123456',524.01,'RMB','alipay')">触发chargeRequest事件</button>
<br/>
跳转到:
<a href="demo01.jsp">demo01</a>
<a href="demo02.jsp">demo02</a>
<a href="demo03.jsp">demo03</a>
<a href="demo04.jsp">demo04</a>
</body>
</html>
