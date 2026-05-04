import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReport } from "../slices/taskSlice";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import "./Report.css";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#94a3b8"];

const Report = () => {
  const dispatch = useDispatch();
  const { report, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchReport());
  }, [dispatch]);

  if (loading && !report) return <div className="loader">Loading report...</div>;
  if (!report) return <div className="empty-state">No report data available</div>;

  return (
    <div className="report-page">
      <header className="report-header">
        <h1 className="report-title">Monthly Progress Report</h1>
        <p className="report-subtitle">Last 30 days of performance analysis</p>
      </header>

      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-card__label">Total Tasks</span>
          <span className="summary-card__value">{report.summary.totalTasks}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__label">Completion Rate</span>
          <span className="summary-card__value">{report.summary.overallCompletionRate}%</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__label">Best Category</span>
          <span className="summary-card__value">{report.summary.bestCategory || "N/A"}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Task Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.pieChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {report.pieChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#1e1e38", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Weekly Consistency</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.barChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                   contentStyle={{ background: "#1e1e38", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                   itemStyle={{ color: "#fff" }}
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="completionRate" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
