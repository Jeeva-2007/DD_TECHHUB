import sys
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage, ToolMessage, HumanMessage

from app.main import app
from app.db.database import init_db, get_incident_history
from app.tools.test_tool import test_tool

class TestIncidentAgent(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_01_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "online")

    def test_02_test_tool_directly(self):
        result = test_tool.invoke({"query": "unit_test_query"})
        self.assertIn("test_tool output", result)
        self.assertIn("unit_test_query", result)

    def test_03_agent_run_flow_mocked(self):
        """Test end-to-end agent execution loop: API -> Agent -> Tool -> Agent -> SQLite."""
        ai_tool_call_msg = AIMessage(
            content="",
            tool_calls=[{"name": "test_tool", "args": {"query": "incident investigation check"}, "id": "call_123"}]
        )
        ai_final_msg = AIMessage(content="Investigation completed. All systems operational.")

        with patch("app.agent.graph.get_llm") as mock_get_llm:
            mock_llm_instance = MagicMock()
            mock_get_llm.return_value = mock_llm_instance
            mock_llm_instance.bind_tools.return_value = mock_llm_instance
            mock_llm_instance.invoke.side_effect = [ai_tool_call_msg, ai_final_msg]

            payload = {
                "incident_id": "INC-TEST-001",
                "prompt": "Call any tools available to you and investigate the situation."
            }
            
            response = self.client.post("/agent/run", json=payload)
            self.assertEqual(response.status_code, 200, response.text)
            data = response.json()
            
            self.assertEqual(data["incident_id"], "INC-TEST-001")
            self.assertEqual(data["status"], "COMPLETED")
            self.assertEqual(data["final_response"], "Investigation completed. All systems operational.")
            self.assertEqual(data["tool_executions_count"], 1)

        # Verify SQLite DB audit trail
        history_response = self.client.get("/incidents/INC-TEST-001")
        self.assertEqual(history_response.status_code, 200)
        history = history_response.json()
        
        self.assertEqual(history["incident"]["incident_id"], "INC-TEST-001")
        self.assertEqual(history["incident"]["status"], "COMPLETED")
        
        executions = history["executions"]
        self.assertEqual(len(executions), 1)
        
        exec_data = executions[0]
        self.assertEqual(exec_data["status"], "COMPLETED")
        
        tool_execs = exec_data["tool_executions"]
        self.assertEqual(len(tool_execs), 1)
        self.assertEqual(tool_execs[0]["tool_name"], "test_tool")
        self.assertEqual(tool_execs[0]["status"], "SUCCESS")
        self.assertIn("incident investigation check", tool_execs[0]["tool_input"])

        messages = exec_data["agent_messages"]
        roles = [m["role"] for m in messages]
        self.assertIn("user", roles)
        self.assertIn("assistant", roles)
        self.assertIn("tool", roles)

if __name__ == "__main__":
    unittest.main()
