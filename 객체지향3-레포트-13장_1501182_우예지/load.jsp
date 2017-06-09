
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@page import="java.sql.*, javax.sql.*, javax.naming.*"%>
<%@page import="org.json.simple.*"%>

<%
	request.setCharacterEncoding("UTF-8");
	response.setCharacterEncoding("UTF-8");


	String callback = request.getParameter("callback");

	String resultData = "failed";

	Connection conn = null;
	PreparedStatement pstmt = null;
	ResultSet rs = null;
	
	JSONObject jsonData = new JSONObject();
	JSONArray  jsonArray = new JSONArray();

	try {

		Class.forName("org.mariadb.jdbc.Driver");

		String url = "jdbc:mariadb://localhost:33060/test";
		String db_id = "root";
		String db_pw = "1234";
		conn = DriverManager.getConnection(url, db_id, db_pw);

		pstmt = conn.prepareStatement("select * from mygallery order by id desc");

		rs = pstmt.executeQuery();

		if(rs != null)
			resultData = "success";
		
		while(rs.next()){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", rs.getInt("id"));
			jsonObject.put("imageName", rs.getString("imageName"));
			
			jsonArray.add(jsonObject);
		}
		jsonData.put("data", jsonArray);
		jsonData.put("result", resultData);
		
		resultData = "success";
	} catch (Exception e) {
		e.printStackTrace();
	} finally {
		if (rs != null) try { rs.close(); } catch(SQLException ex) {}
		if (pstmt != null) try { pstmt.close(); } catch(SQLException ex) {}
		if (conn != null) try { conn.close(); } catch(SQLException ex) {}
	}

	String json = jsonData.toString();

	System.out.println(json);

	out.println(callback+"(");
	out.print(json);
	out.print(")");
%>