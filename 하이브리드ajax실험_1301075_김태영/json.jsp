<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="org.json.simple.*"%>

<%
	String myData = request.getParameter("myData");
	System.out.println(myData);
	
	JSONObject jsonobj = new JSONObject();
	jsonobj.put("key", myData);
	
	String callback = request.getParameter("callback");
	System.out.println(jsonobj);
// org.json.simple.JSONArray;
// org.json.simple.JSONObject;
// callback({json code})

	callback += "(" + jsonobj + ")";

	out.print(callback);
	System.out.println(callback);


%>