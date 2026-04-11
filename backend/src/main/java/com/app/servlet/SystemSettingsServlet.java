package com.app.servlet;

import com.app.dao.mysql.SystemSettingsDAO;
import com.app.util.JSONUtil;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@WebServlet("/api/admin/settings")
public class SystemSettingsServlet extends HttpServlet {
    private SystemSettingsDAO dao = new SystemSettingsDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        try {
            Map<String, String> settings = dao.getSettings();
            JSONObject obj = new JSONObject();
            if (settings != null) obj.putAll(settings);
            
            // Critical Safety: Provide defaults if the database is empty
            if (!obj.containsKey("HANDLING_FEE")) obj.put("HANDLING_FEE", "50.00");
            if (!obj.containsKey("SERVICE_GST")) obj.put("SERVICE_GST", "0.2");
            
            res.getWriter().print(obj.toJSONString());
        } catch (Exception e) {
            res.setStatus(200); // Return partial success with defaults instead of 500
            JSONObject err = new JSONObject();
            err.put("HANDLING_FEE", "50.00");
            err.put("SERVICE_GST", "0.2");
            res.getWriter().print(err.toJSONString());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);
        
        try {
            boolean success = true;
            if (data == null || data.isEmpty()) {
                res.getWriter().print(JSONUtil.createErrorResponse("Empty payload received by parameter hub."));
                return;
            }

            for (Object key : data.keySet()) {
                Object rawVal = data.get(key);
                if (rawVal != null) {
                    if (!dao.updateSetting(key.toString(), rawVal.toString())) success = false;
                }
            }

            if (success) {
                res.getWriter().print(JSONUtil.createSuccessResponse("System logistics fees updated successfully."));
            } else {
                res.getWriter().print(JSONUtil.createErrorResponse("Failed to update system fees. Check database logs."));
            }
        } catch (Exception e) {
            res.setStatus(500);
            res.getWriter().print(JSONUtil.createErrorResponse("Settings Hub Fault: " + e.getMessage()));
        }
    }
}
