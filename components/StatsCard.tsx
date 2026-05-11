interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: "navy" | "orange" | "green" | "red";
}

const colorMap = {
  navy: "bg-navy text-white",
  orange: "bg-orange text-white",
  green: "bg-green-500 text-white",
  red: "bg-red-500 text-white",
};

const iconBg = {
  navy: "bg-white/20",
  orange: "bg-white/20",
  green: "bg-white/20",
  red: "bg-white/20",
};

export default function StatsCard({ title, value, icon, color = "navy" }: StatsCardProps) {
  return (
    <div className={`rounded-xl p-6 shadow-sm flex items-center gap-4 ${colorMap[color]}`}>
      <div className={`text-3xl w-14 h-14 flex items-center justify-center rounded-xl ${iconBg[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm opacity-80 font-medium">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}
