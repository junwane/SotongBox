<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.sql.*"%>
<%@ page import="org.json.simple.*"%>

<%
	Connection con = null;
	ResultSet rs = null;
	PreparedStatement pstmt = null;
	
	try{
		String 	url="jdbc:mariadb://localhost:33060/db_json";
		String id = "root";
		String pw = "1234";
		
		JSONArray json_arr = new JSONArray();

		Class.forName("org.mariadb.jdbc.Driver");
		con = DriverManager.getConnection(url, id, pw);

		pstmt = con.prepareStatement("select * from json_user");
		rs = pstmt.executeQuery();
		
		while(rs.next()){
			JSONObject json_obj = new JSONObject();
			json_obj.put("pname", rs.getString("pname")); //애트리뷰트가 키 속성이 밸류
			json_obj.put("age", rs.getInt("age"));
			System.out.println(json_obj);
			
			json_arr.add(json_obj);
		}
		System.out.println(json_arr);
		
		String callback = request.getParameter("callback");
		callback += "(" + json_arr + ")";
		out.println(callback);
		System.out.println(callback);
	} catch (Exception e) { 
		out.println(e); 
	} finally {
		if(pstmt != null) try { pstmt.close(); } catch (SQLException ex) {}
		if(con != null) try { con.close(); } catch (SQLException ex) {}
		if(rs != null) try { rs.close(); } catch (SQLException ex) {}
	}
	
	

%>