"use client";

import { Truck, Package, CreditCard, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const features = [
  {
    icon: Truck,
    title: "Giao Hàng Toàn Quốc",
    description: "Miễn phí ship cho đơn từ 300,000đ. Giao hàng nhanh chóng.",
  },
  {
    icon: Package,
    title: "Đóng Gói Cẩn Thận",
    description: "Sách được bọc kỹ 3 lớp (chống sốc, chống nước), đảm bảo nguyên vẹn.",
  },
  {
    icon: CreditCard,
    title: "Thanh Toán Linh Hoạt",
    description: "Hỗ trợ COD (thanh toán khi nhận hàng) hoặc chuyển khoản ngân hàng.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section bg-[#FDFBF7]">
      <div className="container-custom">
        <FadeIn>
          <h2 className="sr-only">Cam kết dịch vụ</h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={0.1 * index} className="h-full">
              <div className="h-full text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-primary transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-lg font-bold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
