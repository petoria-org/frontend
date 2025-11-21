export default function Navbar() {
  return (
    <div className="w-full shadow-sm bg-white py-4 px-8 flex justify-between items-center">
      <div className="flex items-center gap-4 text-gray-600">
        <button className="hover:text-blue-500">خانه</button>
        <button className="hover:text-blue-500">داستان‌های موفق</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">آگهی جدید</button>
      </div>
      <div className="text-2xl font-bold text-blue-700">PETORIA</div>
    </div>
  );
}
