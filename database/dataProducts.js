function createProduct() {
  if (localStorage.getItem("products") == null) {
    const products = [
      {
        id: 1,
        name: "Nike Air Force 1",
        desc: "Giày thể thao cao cấp, form chuẩn.",
        price: 1500000,
        category: "Thể thao",
        img: "nikeAir.png",
        importPrice: 800000,
        quantity: 30,
        isHidden: false,
      },
      {
        id: 2,
        name: "Adidas Ultraboost",
        desc: "Êm chân, chạy bộ cực nhẹ.",
        price: 2000000,
        category: "Thể thao",
        img: "AdidasUltraboost.png",
        importPrice: 1000000,
        quantity: 25,
        isHidden: false,
      },
      {
        id: 3,
        name: "Converse Classic",
        desc: "Phong cách cổ điển, phù hợp mọi outfit.",
        price: 1200000,
        category: "Thể thao",
        img: "converseClassic.png",
        importPrice: 900000,
        quantity: 20,
        isHidden: false,
      },
      {
        id: 4,
        name: "Puma RS-X",
        desc: "Thiết kế trẻ trung, năng động.",
        price: 1300000,
        category: "Thể thao",
        img: "PumaRSX.png",
        importPrice: 850000,
        quantity: 18,
        isHidden: false,
      },
      {
        id: 5,
        name: "Dép lê Adidas",
        desc: "Dép thoải mái, đi biển hoặc đi trong nhà.",
        price: 350000,
        category: "Dép",
        img: "depAdidas.png",
        importPrice: 200000,
        quantity: 50,
        isHidden: false,
      },
      {
        id: 6,
        name: "Sandal nữ quai ngang",
        desc: "Sandal thời trang, đi dạo phố.",
        price: 400000,
        category: "Sandal",
        img: "sandalNu.png",
        importPrice: 250000,
        quantity: 40,
        isHidden: false,
      },
      {
        id: 7,
        name: "Giày tây nam da bò",
        desc: "Phong cách lịch lãm, phù hợp công sở.",
        price: 900000,
        category: "Tây",
        img: "giayTay.png",
        importPrice: 600000,
        quantity: 15,
        isHidden: false,
      },
      {
        id: 8,
        name: "Sandal nữ đế thấp",
        desc: "Nhẹ nhàng, phù hợp đi dạo hoặc đi chơi.",
        price: 350000,
        category: "Sandal",
        img: "sandalDeThap.png",
        importPrice: 200000,
        quantity: 25,
        isHidden: false,
      },
      {
        id: 9,
        name: "Cao gót nữ da thật",
        desc: "Cao gót sang trọng, phù hợp đi tiệc.",
        price: 700000,
        category: "Cao gót",
        img: "capGotNu.png",
        importPrice: 450000,
        quantity: 20,
        isHidden: false,
      },
      {
        id: 10,
        name: "Dép lê nữ thời trang",
        desc: "Đi lại thoải mái, đi biển hoặc đi học.",
        price: 300000,
        category: "Dép",
        img: "depNu.png",
        importPrice: 180000,
        quantity: 35,
        isHidden: false,
      },
      {
        id: 11,
        name: "Giày Sneaker Vans Old Skool",
        desc: "Phong cách đường phố, dễ phối đồ.",
        price: 1100000,
        category: "Thể thao",
        img: "vansOldSkool.png",
        importPrice: 700000,
        quantity: 25,
        isHidden: false,
      },
      {
        id: 12,
        name: "Giày Bata Trắng Nữ",
        desc: "Đơn giản, tinh tế, dễ phối đồ.",
        price: 450000,
        category: "Thể thao",
        img: "bataTrang.png",
        importPrice: 300000,
        quantity: 40,
        isHidden: false,
      },
      {
        id: 13,
        name: "Giày Thể Thao Nam Bitis Hunter",
        desc: "Sản phẩm Việt chất lượng cao.",
        price: 950000,
        category: "Thể thao",
        img: "bitisHunter.png",
        importPrice: 600000,
        quantity: 30,
        isHidden: false,
      },
      {
        id: 14,
        name: "Sandal Nam Quai Chéo",
        desc: "Thoáng mát, dễ mang.",
        price: 320000,
        category: "Sandal",
        img: "sandalNam.png",
        importPrice: 200000,
        quantity: 35,
        isHidden: false,
      },
      {
        id: 15,
        name: "Cao Gót Nữ 7 Phân",
        desc: "Thanh lịch, phù hợp công sở.",
        price: 650000,
        category: "Cao gót",
        img: "caoGot7phan.png",
        importPrice: 420000,
        quantity: 20,
        isHidden: false,
      },
    ];

    localStorage.setItem("products", JSON.stringify(products));
    console.log("Nạp dữ liệu sản phẩm thành công");
  } else {
    console.log("Dữ liệu sản phẩm đã có trong localStorage, không nạp lại.");
  }
}

function createAccount() {
  if (localStorage.getItem("accounts") == null) {
    const accounts = [
      { username: "admin", password: "123456", role: "admin" },
      {
        username: "user1",
        password: "1",
        role: "user",
        cart: [],
        address: "Hà Nội",
        email: "user1@gmail.com",
        phone: "0123456789",
        status: 1, // 1: hoạt động, 0: khóa
      },
      {
        username: "user2",
        password: "1",
        role: "user",
        cart: [],
        address: "Hà Nội",
        email: "se1@gmail.com",
        phone: "0123456789",
        status: 1, // 1: hoạt động, 0: khóa
      },
      {
        username: "user3",
        password: "1",
        role: "user",
        cart: [],
        address: "Hà Nội",
        email: "user1@gmail.com",
        phone: "0123456789",
        status: 1, // 1: hoạt động, 0: khóa
      },
      {
        username: "user4",
        password: "1",
        role: "user",
        cart: [],
        address: "Hà Nội",
        email: "ur1@gmail.com",
        phone: "0123456789",
        status: 1, // 1: hoạt động, 0: khóa
      },
      {
        username: "user5",
        password: "2",
        role: "user",
        cart: [],
        address: "TP.HCM",
        email: "usr2@gmail.com",
        phone: "0987654321",
        status: 1,
      },
      {
        username: "user6",
        password: "1",
        role: "user",
        cart: [],
        address: "Hà Nội",
        email: "user@gmail.com",
        phone: "0123456789",
        status: 1, // 1: hoạt động, 0: khóa
      },
      {
        username: "user7",
        password: "2",
        role: "user",
        cart: [],
        address: "TP.HCM",
        email: "ser2@gmail.com",
        phone: "0987654321",
        status: 1,
      },
      {
        username: "user8",
        password: "1",
        role: "user",
        cart: [],
        address: "Đà Nẵng",
        email: "user8@gmail.com",
        phone: "0911222333",
        status: 1,
      },
      {
        username: "user9",
        password: "2",
        role: "user",
        cart: [],
        address: "Cần Thơ",
        email: "user9@gmail.com",
        phone: "0933444555",
        status: 1,
      },
      {
        username: "user10",
        password: "3",
        role: "user",
        cart: [],
        address: "Hải Phòng",
        email: "user10@gmail.com",
        phone: "0955666777",
        status: 1,
      },
      {
        username: "user11",
        password: "4",
        role: "user",
        cart: [],
        address: "Huế",
        email: "user11@gmail.com",
        phone: "0977888999",
        status: 1,
      },
      {
        username: "user12",
        password: "5",
        role: "user",
        cart: [],
        address: "Bình Dương",
        email: "user12@gmail.com",
        phone: "0999000111",
        status: 1,
      },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));
    console.log("Nạp dữ liệu tài khoản thành công");
  } else {
    console.log("Dữ liệu tài khoản đã có trong localStorage, không nạp lại.");
  }
}
function createOrders() {
  if (localStorage.getItem("orders") == null) {
    const orders = [
      {
        id: 101,
        customer: "user1",
        date: "2025-10-20",
        status: "new", // new | processing | delivered | cancelled
        paymentMethod: "bank",
        items: [
          { id: 1, name: "Nike Air Force 1", quantity: 1, price: 1500000 },
          { id: 2, name: "Adidas Ultraboost", quantity: 1, price: 2000000 },
        ],
        total: 1500000 + 2000000, // 3500000
      },
      {
        id: 102,
        customer: "user2",
        date: "2025-10-22",
        status: "processing",
        paymentMethod: "bank",
        items: [
          { id: 3, name: "Converse Classic", quantity: 2, price: 1200000 },
        ],
        total: 1200000 * 2, // 2400000
      },
      {
        id: 103,
        customer: "user1",
        date: "2025-10-25",
        status: "delivered",
        paymentMethod: "bank",
        items: [
          { id: 4, name: "Puma RS-X", quantity: 1, price: 1300000 },
          { id: 1, name: "Nike Air Force 1", quantity: 1, price: 1500000 },
        ],
        total: 1300000 + 1500000, // 2800000
      },
      {
        id: 104,
        customer: "user2",
        date: "2025-10-27",
        status: "cancelled",
        paymentMethod: "bank",
        items: [
          { id: 1, name: "Adidas Ultraboost", quantity: 1, price: 2000000 },
        ],
        total: 2000000,
      },
      {
        id: 105,
        customer: "user3",
        date: "2025-10-28",
        status: "new",
        paymentMethod: "bank",
        items: [
          { id: 11, name: "Vans Old Skool", quantity: 1, price: 1100000 },
          { id: 12, name: "Bata Trắng Nữ", quantity: 2, price: 450000 },
        ],
        total: 1100000 + 2 * 450000,
      },
      {
        id: 106,
        customer: "user5",
        date: "2025-10-29",
        status: "processing",
        paymentMethod: "cash",
        items: [{ id: 13, name: "Bitis Hunter", quantity: 1, price: 950000 }],
        total: 950000,
      },
      {
        id: 107,
        customer: "user6",
        date: "2025-11-01",
        status: "delivered",
        paymentMethod: "bank",
        items: [
          { id: 14, name: "Sandal Nam Quai Chéo", quantity: 3, price: 320000 },
        ],
        total: 3 * 320000,
      },
      {
        id: 108,
        customer: "user7",
        date: "2025-11-02",
        status: "cancelled",
        paymentMethod: "cash",
        items: [
          { id: 15, name: "Cao Gót Nữ 7 Phân", quantity: 2, price: 650000 },
        ],
        total: 2 * 650000,
      },
      {
        id: 109,
        customer: "user8",
        date: "2025-11-05",
        status: "new",
        paymentMethod: "bank",
        items: [
          { id: 11, name: "Vans Old Skool", quantity: 1, price: 1100000 },
          { id: 13, name: "Bitis Hunter", quantity: 1, price: 950000 },
        ],
        total: 1100000 + 950000,
      },
    ];

    localStorage.setItem("orders", JSON.stringify(orders));
    console.log("Nạp dữ liệu đơn hàng giày thành công");
  } else {
    console.log("Dữ liệu đơn hàng đã có trong localStorage, không nạp lại.");
  }
}

function createImports() {
  if (localStorage.getItem("imports") == null) {
    const imports = [
      {
        id: 201,
        date: "2025-10-15",
        status: "in-progress", // in-progress | completed
        items: [
          {
            productId: 1,
            name: "Nike Air Force 1",
            quantity: 10,
            importPrice: 800000,
          },
          {
            productId: 2,
            name: "Adidas Ultraboost",
            quantity: 5,
            importPrice: 1000000,
          },
        ],
        total: 10 * 800000 + 5 * 1000000, // 13.000.000
      },
      {
        id: 202,
        date: "2025-10-18",
        status: "completed",
        items: [
          {
            productId: 3,
            name: "Converse Classic",
            quantity: 8,
            importPrice: 900000,
          },
          { productId: 4, name: "Puma RS-X", quantity: 4, importPrice: 850000 },
        ],
        total: 8 * 900000 + 4 * 850000,
      },
      {
        id: 203,
        date: "2025-10-19",
        status: "in-progress", // in-progress | completed
        items: [
          {
            productId: 1,
            name: "Nike Air Force 1",
            quantity: 10,
            importPrice: 800000,
          },
          {
            productId: 2,
            name: "Adidas Ultraboost",
            quantity: 5,
            importPrice: 1000000,
          },
        ],
        total: 10 * 800000 + 5 * 1000000, // 13.000.000
      },
      {
        id: 204,
        date: "2025-10-22",
        status: "in-progress", // in-progress | completed
        items: [
          {
            productId: 1,
            name: "Nike Air Force 1",
            quantity: 10,
            importPrice: 800000,
          },
          {
            productId: 2,
            name: "Adidas Ultraboost",
            quantity: 5,
            importPrice: 1000000,
          },
        ],
        total: 10 * 800000 + 5 * 1000000, // 13.000.000
      },
      {
        id: 205,
        date: "2025-10-25",
        status: "completed",
        items: [
          {
            productId: 11,
            name: "Vans Old Skool",
            quantity: 10,
            importPrice: 700000,
          },
          {
            productId: 12,
            name: "Bata Trắng Nữ",
            quantity: 15,
            importPrice: 300000,
          },
        ],
        total: 10 * 700000 + 15 * 300000,
      },
      {
        id: 206,
        date: "2025-10-27",
        status: "in-progress",
        items: [
          {
            productId: 13,
            name: "Bitis Hunter",
            quantity: 8,
            importPrice: 600000,
          },
        ],
        total: 8 * 600000,
      },
      {
        id: 207,
        date: "2025-10-30",
        status: "completed",
        items: [
          {
            productId: 14,
            name: "Sandal Nam Quai Chéo",
            quantity: 12,
            importPrice: 200000,
          },
        ],
        total: 12 * 200000,
      },
      {
        id: 208,
        date: "2025-11-01",
        status: "in-progress",
        items: [
          {
            productId: 15,
            name: "Cao Gót Nữ 7 Phân",
            quantity: 10,
            importPrice: 420000,
          },
        ],
        total: 10 * 420000,
      },
      {
        id: 209,
        date: "2025-11-02",
        status: "completed",
        items: [
          {
            productId: 11,
            name: "Vans Old Skool",
            quantity: 5,
            importPrice: 700000,
          },
          {
            productId: 13,
            name: "Bitis Hunter",
            quantity: 5,
            importPrice: 600000,
          },
        ],
        total: 5 * 700000 + 5 * 600000,
      },
    ];

    localStorage.setItem("imports", JSON.stringify(imports));
    console.log("Nạp dữ liệu phiếu nhập hàng thành công");
  } else {
    console.log("Dữ liệu phiếu nhập đã có trong localStorage, không nạp lại.");
  }
}
