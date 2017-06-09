<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.text.DateFormat"%>
<%@page import="java.util.Date"%>

<%@page
	import="org.apache.tomcat.util.http.fileupload.servlet.ServletRequestContext"%>
<%@page import="org.apache.tomcat.util.http.fileupload.FileItemFactory"%>
<%@page import="java.io.File"%>
<%@page
	import="org.apache.tomcat.util.http.fileupload.disk.DiskFileItemFactory"%>
<%@page import="org.apache.tomcat.util.http.fileupload.FileItem"%>
<%@page import="java.util.List"%>
<%@page
	import="org.apache.tomcat.util.http.fileupload.servlet.ServletFileUpload"%>
<%@page import="org.json.simple.*"%>
<%@page import="java.sql.*, javax.sql.*, javax.naming.*"%>

<%
	
	request.setCharacterEncoding("UTF-8");
	response.setCharacterEncoding("UTF-8");

	String resultData = "failed";

	SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HHmmss");
	String today = simpleDateFormat.format(new Date());
	String fileName = today + ".jpg";
	
	Connection conn = null;
	PreparedStatement pstmt = null;
	ResultSet rs = null;

	if (ServletFileUpload.isMultipartContent(request)) {
		
		try {

			Class.forName("org.mariadb.jdbc.Driver");

			String url = "jdbc:mariadb://localhost:33060/test";
			String db_id = "root";
			String db_pw = "1234";
			conn = DriverManager.getConnection(url, db_id, db_pw);

			FileItemFactory factory = new DiskFileItemFactory();
			ServletFileUpload upload = new ServletFileUpload(factory);
			List<FileItem> multiparts = upload.parseRequest(new ServletRequestContext(request));

			for (FileItem item : multiparts) {
				if (!item.isFormField()) {
					
					File file = new File("../webapps/ROOT/image", fileName);
					System.out.println(file.getAbsolutePath());
					if(file.getParentFile().exists() == false) {
						file.getParentFile().mkdirs();
					}
					item.write(file);
				}
			}

			pstmt = conn.prepareStatement("insert into mygallery(imageName) values (?)");
			pstmt.setString(1, fileName);

			int num = pstmt.executeUpdate();

			System.out.println("파일전송 후 결과 num = " + num);

			resultData = "success";
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (rs != null) try { rs.close(); } catch(SQLException ex) {}
			if (pstmt != null) try { pstmt.close(); } catch(SQLException ex) {}
			if (conn != null) try { conn.close(); } catch(SQLException ex) {}
		}

	}

    JSONObject jsonObject = new JSONObject();
    jsonObject.put("result",  resultData);
    
    out.println(jsonObject.toString());
    
%>