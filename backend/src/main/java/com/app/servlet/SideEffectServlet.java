package com.app.servlet;

import com.app.dao.mysql.SideEffectMySQLDAO;
import com.app.model.SideEffect;
import com.app.util.JSONUtil;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/side-effects/*")
public class SideEffectServlet extends HttpServlet {
    private SideEffectMySQLDAO dao = new SideEffectMySQLDAO();

    @Override
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        String productId = req.getParameter("product_id");
        if (productId == null) {
            res.getWriter().print(JSONUtil.createErrorResponse("product_id required"));
            return;
        }
        List<SideEffect> list = dao.getByProduct(productId);
        JSONArray arr = new JSONArray();
        for (SideEffect se : list) {
            JSONObject obj = new JSONObject();
            obj.put("effect_id", se.getEffectId());
            obj.put("product_id", se.getProductId());
            obj.put("effect", se.getEffect());
            obj.put("severity", se.getSeverity());
            obj.put("added_at", se.getAddedAt());
            arr.add(obj);
        }
        res.getWriter().print(arr.toJSONString());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        JSONObject data = JSONUtil.parseRequest(req);
        SideEffect se = new SideEffect();
        se.setProductId((String) data.get("product_id"));
        se.setEffect((String) data.get("effect"));
        se.setSeverity((String) data.get("severity"));
        if (dao.create(se)) {
            res.getWriter().print(JSONUtil.createSuccessResponse("Side effect added."));
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Failed to add side effect."));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json");
        String effectId = req.getParameter("id");
        if (effectId != null && dao.delete(effectId)) {
            res.getWriter().print(JSONUtil.createSuccessResponse("Side effect removed."));
        } else {
            res.getWriter().print(JSONUtil.createErrorResponse("Delete failed."));
        }
    }
}
