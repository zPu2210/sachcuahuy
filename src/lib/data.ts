// Book data - In production, this would come from Supabase
export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  stock: number;
  coverImage: string;
  images: string[];
  isbn: string;
  publisher: string;
  publishedDate: string;
  pageCount: number;
  isNew?: boolean;
  isComingSoon?: boolean;
}

export const books: Book[] = [
  {
    id: "1",
    slug: "mien-nam-cua-huy",
    title: "Miền Nam của Huy",
    author: "Trọng Huy",
    description: `"Nơi ấy có Mina và một mái nhà"

Miền Nam của Huy là tập tản văn ghi lại những kỷ niệm, những mảnh ghép cuộc sống của tác giả tại Sài Gòn. Cùng với chú chó Mina - người bạn đồng hành trung thành, những câu chuyện nhỏ được kể lại với giọng văn nhẹ nhàng, đầy hoài niệm.

Cuốn sách mang đến cho độc giả những khoảnh khắc bình dị nhưng đáng nhớ trong cuộc sống - từ những buổi sáng thức dậy bên Mina, những chuyến đi dạo qua các con hẻm Sài Gòn, đến những suy tư về quê hương và tuổi trẻ.

• Bìa cứng, illustration độc đáo
• 34 chương, ~200 trang
• Phù hợp cho người yêu văn học đương đại`,
    shortDescription:
      "Tập tản văn ghi lại những kỷ niệm, những mảnh ghép cuộc sống tại Sài Gòn. Cùng với chú chó Mina - người bạn đồng hành trung thành.",
    price: 179000,
    stock: 1000,
    coverImage: "/images/books/mien-nam-cua-huy.jpg",
    images: [
      "/images/books/mien-nam-cua-huy.jpg",
      "/images/books/mien-nam-cua-huy-back.jpg",
      "/images/books/mien-nam-cua-huy-spread.jpg",
    ],
    isbn: "978-604-464-000-0",
    publisher: "NXB Dân Trí & Thế Giới",
    publishedDate: "2026",
    pageCount: 200,
    isNew: true,
  },
  {
    id: "2",
    slug: "tac-pham-2",
    title: "Tác Phẩm Khác",
    author: "Trọng Huy",
    description: "Mô tả sách sẽ được cập nhật.",
    shortDescription: "Cuốn sách trước đó của Trọng Huy.",
    price: 159000,
    stock: 500,
    coverImage: "/images/books/tac-pham-2.jpg",
    images: ["/images/books/tac-pham-2.jpg"],
    isbn: "978-604-464-001-0",
    publisher: "NXB Dân Trí",
    publishedDate: "2025",
    pageCount: 180,
  },
  {
    id: "3",
    slug: "sap-ra-mat",
    title: "Tác Phẩm Mới",
    author: "Trọng Huy",
    description: "Đang trong quá trình hoàn thiện.",
    shortDescription: "Cuốn sách tiếp theo của Trọng Huy.",
    price: 0,
    stock: 0,
    coverImage: "/images/books/coming-soon.jpg",
    images: [],
    isbn: "",
    publisher: "",
    publishedDate: "2026",
    pageCount: 0,
    isComingSoon: true,
  },
];

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((book) => book.slug === slug);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

// Author info
export const authorInfo = {
  name: "Trọng Huy",
  title: "Tác giả • Voice Talent",
  bio: `Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn.
Phát thanh viên radio - Voice Talent Quảng Cáo.
Bên cạnh công việc giọng nói, anh còn là một người viết với những tản văn nhẹ nhàng về cuộc sống đời thường.`,
  shortBio:
    "Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn. Phát thanh viên radio - Voice Talent Quảng Cáo.",
  image: "/images/author/trong-huy.jpg",
  location: "Sài Gòn, Việt Nam",
};
