const StatCard = ({ title, value, icon }) => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
    <p className="text-sm text-gray-500 font-medium">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
  </div>
);

export default StatCard;