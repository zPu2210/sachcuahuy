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
    <section className="section bg-paper">
      <div className="container-custom">
        <h2 className="sr-only">Cam kết dịch vụ</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="h-full">
              <div className="group h-full text-center p-8 bg-white rounded-2xl border border-cobalt/10 shadow-sm hover:shadow-xl hover:shadow-cobalt/10 hover:border-cobalt/30 transition-all duration-300 hover:-translate-y-1">
                <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 watercolor-wash-cobalt rounded-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                  />
                  <feature.icon
                    className="relative w-9 h-9 text-cobalt-dark"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-serif text-lg font-bold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
