<%--
  Created by IntelliJ IDEA.
  User: 蒙卓明
  Date: 2017/6/30
  Time: 0:26
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>测试onlaunch事件和onPageView事件</title>
    <script type="text/javascript" src="./js/analytics.js"></script>
</head>
<body>
Demo01
<%--
第一次访问触发onlaunch事件，向服务器请求的url为
http://hadoop/BfImg.gif?en=e_1&ver=1&pl=website&sdk=js&u_uid=85A13DE5-BB08-469D-ABC0-60230C4359A5&u_sid=32F24918-94CE-45C8-9EF6-B52873A930C2&c_time=1498800022622&l=zh-CN&b_iev=Mozilla%2F5.0%20(Windows%20NT%206.1%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F58.0.3029.110%20Safari%2F537.36&b_rst=1366*768
以及pageView事件，向服务器请求的url为
http://hadoop/BfImg.gif?en=e_pv&p_url=http%3A%2F%2Flocalhost%3A8080%2Fdemo01.jsp&tt=%E6%B5%8B%E8%AF%951&ver=1&pl=website&sdk=js&u_uid=85A13DE5-BB08-469D-ABC0-60230C4359A5&u_sid=32F24918-94CE-45C8-9EF6-B52873A930C2&c_time=1498800022630&l=zh-CN&b_iev=Mozilla%2F5.0%20(Windows%20NT%206.1%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F58.0.3029.110%20Safari%2F537.36&b_rst=1366*768
 --%>
跳转到:
<a href="demo01.jsp">demo01</a>
<a href="demo02.jsp">demo02</a>
<a href="demo03.jsp">demo03</a>
<a href="demo04.jsp">demo04</a>
</body>
</html>
