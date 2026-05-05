import { Truck, Package, CreditCard, type LucideIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface FeaturesSectionProps {
  shippingFreeCities: string[];
  shippingFlatFee: number;
  shippingThreshold?: number | null;
}

function shippingDescription({
  shippingFreeCities,
  shippingFlatFee,
  shippingThreshold,
}: FeaturesSectionProps): string {
  if (shippingThreshold && shippingThreshold > 0) {
    return `Miễn phí ship cho đơn từ ${formatPrice(shippingThreshold)}.`;
  }

  if (shippingFreeCities.length > 0) {
    const cities = shippingFreeCities.map((city) => city.toUpperCase()).join("/");
    return `Miễn phí ship ${cities}; tỉnh khác ${formatPrice(shippingFlatFee)}.`;
  }

  return `Phí ship toàn quốc ${formatPrice(shippingFlatFee)}.`;
}

const staticFeatures: Array<{
  icon: LucideIcon;
  title: string;
  description?: string;
}> = [
  {
    icon: Truck,
    title: "Giao Hàng Toàn Quốc",
  },
  {
    icon: Package,
    title: "Đóng Gói Cẩn Thận",
    description: "Sách được bọc kỹ 3 lớp (chống sốc, chống nước), đảm bảo nguyên vẹn.",
  },
  {
    icon: CreditCard,
    title: "Đặt Trước Rõ Ràng",
    description: "Có thông tin chuyển khoản và mã QR; mình sẽ liên hệ xác nhận đơn.",
  },
];

export function FeaturesSection(props: FeaturesSectionProps) {
  const features = staticFeatures.map((feature) =>
    feature.icon === Truck
      ? { ...feature, description: shippingDescription(props) }
      : feature,
  );

  return (
    <section className="section bg-[#FDFBF7]">
      <div className="container-custom">
        <h2 className="sr-only">Cam kết dịch vụ</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="h-full">
              <div className="h-full text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-primary transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-lg font-bold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
