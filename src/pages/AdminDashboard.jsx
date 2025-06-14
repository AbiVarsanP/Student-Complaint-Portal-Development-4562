import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { FaFileAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useComplaints } from '../context/ComplaintContext';

const AdminDashboard = () => {
  const { getComplaintStats } = useComplaints();
  const stats = getComplaintStats();

  const statsCards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      icon: FaFileAlt,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: FaClock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: FaCheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Resolution Rate',
      value: stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%',
      icon: FaExclamationTriangle,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const categoryChartOptions = {
    title: {
      text: 'Complaints by Category',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: 'Complaints',
        type: 'pie',
        radius: '50%',
        data: Object.entries(stats.byCategory).map(([category, count]) => ({
          value: count,
          name: category
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const statusChartOptions = {
    title: {
      text: 'Status Distribution',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['Pending', 'Resolved']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Complaints',
        type: 'bar',
        data: [
          { value: stats.pending, itemStyle: { color: '#f59e0b' } },
          { value: stats.resolved, itemStyle: { color: '#10b981' } }
        ],
        barWidth: '50%'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Overview of student complaints and system statistics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`${stat.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className={`text-3xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <ReactECharts option={categoryChartOptions} style={{ height: '400px' }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <ReactECharts option={statusChartOptions} style={{ height: '400px' }} />
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/complaints"
                className="flex items-center justify-center p-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                <FaFileAlt className="w-5 h-5 mr-2" />
                View All Complaints
              </Link>
              <Link
                to="/admin/complaints?filter=pending"
                className="flex items-center justify-center p-4 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
              >
                <FaClock className="w-5 h-5 mr-2" />
                Pending Complaints
              </Link>
              <Link
                to="/admin/complaints?filter=resolved"
                className="flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                <FaCheckCircle className="w-5 h-5 mr-2" />
                Resolved Complaints
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;