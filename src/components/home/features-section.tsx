import { Truck, Package, CreditCard } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Giao Hàng Toàn Quốc",
    description: "Miễn phí ship cho đơn từ 300,000đ. Giao hàng 2-5 ngày.",
  },
  {
    icon: Package,
    title: "Đóng Gói Cẩn Thận",
    description: "Sách được bọc kỹ, đảm bảo nguyên vẹn khi đến tay bạn.",
  },
  {
    icon: CreditCard,
    title: "Thanh Toán Linh Hoạt",
    description: "COD hoặc chuyển khoản. An toàn, tiện lợi.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
