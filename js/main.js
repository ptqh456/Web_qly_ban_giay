window.onload = function () {
  createAccount();
  createProduct();
  createOrders();
  createImports();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userMenuIcon = document.querySelector(".icon.user-menu");

  if (!currentUser) {
    userMenuIcon.classList.add("disabled");
  } else {
    userMenuIcon.classList.remove("disabled");
    showUsername(currentUser.username);
  }
  loadCart();
  updateCartCount();

  // Thêm event listener cho icon giỏ hàng
  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    cartIcon.addEventListener("click", openCart);
  }

  const products = getFilteredProducts();
  displayList(products, perPage, currentPage);
  setupPagination(products, perPage);
};

function openLogin() {
  document.getElementById("loginForm").style.display = "flex";
  document.getElementById("registerForm").style.display = "none";
}

function openRegister() {
  document.getElementById("registerForm").style.display = "flex";
  document.getElementById("loginForm").style.display = "none";
}

function closeForm() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
}

let slideIndex = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(i) {
  if (i >= slides.length) slideIndex = 0;
  else if (i < 0) slideIndex = slides.length - 1;
  else slideIndex = i;

  const slidesContainer = document.querySelector(".slides");
  if (slidesContainer) {
    slidesContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
  }
}
function nextSlide() {
  showSlide(slideIndex + 1);
}
function prevSlide() {
  showSlide(slideIndex - 1);
}

setInterval(nextSlide, 3000);

const registerForm = document.querySelector("#registerForm form");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("reg_username").value.trim();
    const password = document.getElementById("reg_password").value.trim();
    const repass = document.getElementById("repass").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    // 1. Kiểm tra các trường bắt buộc
    if (!username) {
      showToast("Vui lòng nhập tên đăng nhập!", "warning");
      document.getElementById("reg_username").focus();
      return;
    }

    if (!password) {
      showToast("Vui lòng nhập mật khẩu!", "warning");
      document.getElementById("reg_password").focus();
      return;
    }

    if (!repass) {
      showToast("Vui lòng nhập lại mật khẩu!", "warning");
      document.getElementById("repass").focus();
      return;
    }

    if (!email) {
      showToast("Vui lòng nhập email!", "warning");
      document.getElementById("email").focus();
      return;
    }

    if (!phone) {
      showToast("Vui lòng nhập số điện thoại!", "warning");
      document.getElementById("phone").focus();
      return;
    }

    if (password !== repass) {
      showToast("Mật khẩu nhập lại không khớp!", "error");
      const repassInput = document.getElementById("repass");
      repassInput.value = "";
      repassInput.focus();
      return;
    }

    const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      showToast(
        "Số điện thoại không hợp lệ! (VD: 0912345678 hoặc +84912345678)",
        "warning"
      );
      document.getElementById("phone").focus();
      return;
    }

    if (!address) {
      showToast("Vui lòng nhập address!", "warning");
      document.getElementById("address").focus();
      return;
    }

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    let existsUsername = accounts.some((acc) => acc.username === username);
    if (existsUsername) {
      showToast("Tên đăng nhập đã tồn tại!", "error");
      document.getElementById("reg_username").focus();
      return;
    }

    let existsEmail = accounts.some((acc) => acc.email === email);
    if (existsEmail) {
      showToast("Email đã được sử dụng!", "error");
      document.getElementById("email").focus();
      return;
    }

    let existsPhone = accounts.some((acc) => acc.phone === phone);
    if (existsPhone) {
      showToast("Số điện thoại đã được sử dụng!", "error");
      document.getElementById("phone").focus();
      return;
    }

    const newUser = {
      username,
      password,
      email,
      phone,
      address,
      role: "user",
      status: 1,
      cart: [],
    };

    accounts.push(newUser);
    localStorage.setItem("accounts", JSON.stringify(accounts));

    showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success");
    openLogin();
  });
}

const loginForm = document.getElementById("loginForm_json");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("login_username").value.trim();
    const password = document.getElementById("login_password").value.trim();

    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    let user = accounts.find(
      (u) => u.username === username && u.password === password
    );

    if (user && user.status === 1) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      showUsername(user.username);
      closeForm();

      const userMenuIcon = document.querySelector(".icon.user-menu");
      userMenuIcon.classList.remove("disabled");

      // Load giỏ hàng sau khi đăng nhập
      loadCart();
      updateCartCount();
      return;
    }

    if (user && user.status === 0) {
      const error = document.getElementById("error");
      if (error) {
        error.textContent = "Tài khoản của bạn đã bị khóa!";
        error.style.display = "block";
      }
      return;
    }

    const error = document.getElementById("error");
    if (error) {
      error.innerHTML = `
        <i class="bx bx-x" style="border-radius: 50%; background-color: #ffaaaa"></i>
        Đăng nhập KHÔNG thành công. Bạn vui lòng thử lại hoặc đăng nhập bằng cách khác nhé!
      `;
      error.style.display = "block";
    }
  });
}

function showUsername(name) {
  const usernameDisplay = document.getElementById("usernameDisplay");
  if (usernameDisplay) {
    usernameDisplay.textContent = name;
    const displayName = name.length > 10 ? name.substring(0, 10) + "..." : name;
    usernameDisplay.textContent = displayName;
  }
}

// Cập nhật hàm viewUserInfo để hiển thị lịch sử đơn hàng
function viewUserInfo() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    openLogin();
    return;
  }

  document.getElementById("taiKhoan").style.display = "block";

  const usernameSpan = document.querySelector("#infoBox .info-item span");
  if (usernameSpan) {
    usernameSpan.textContent = currentUser.username;
  }

  const emailInput = document.getElementById("infoEmail");
  if (emailInput) {
    emailInput.value = currentUser.email || "";
  }

  const phoneInput = document.getElementById("infoPhone");
  if (phoneInput) {
    phoneInput.value = currentUser.phone || "";
  }

  const addressInput = document.getElementById("infoAddress");
  if (addressInput) {
    addressInput.value = currentUser.address || "";
  }

  // Hiển thị lịch sử đơn hàng
  displayOrderHistory(currentUser.username);
}

// Hiển thị lịch sử đơn hàng
function displayOrderHistory(username) {
  const orderHistoryDiv = document.getElementById("orderHistory");
  if (!orderHistoryDiv) return;

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const userOrders = orders.filter((order) => order.customer === username);

  if (userOrders.length === 0) {
    orderHistoryDiv.innerHTML =
      '<p class="no-orders">Chưa có đơn hàng nào.</p>';
    return;
  }

  // Sắp xếp đơn hàng mới nhất lên đầu
  userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  let html = '<div class="orders-list">';

  userOrders.forEach((order) => {
    const statusText = getStatusText(order.status);
    const statusClass = getStatusClass(order.status);

    html += `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info-left">
            <span class="order-id">Đơn hàng #${order.id}</span>
            <span class="order-date">${formatDate(order.date)}</span>
          </div>
          <span class="order-status ${statusClass}">${statusText}</span>
        </div>
        
        <div class="order-items">
          ${order.items
            .map(
              (item) => `
            <div class="order-item">
              <span class="item-name">${item.name}</span>
              <span class="item-quantity">x${item.quantity}</span>
              <span class="item-price">${item.price.toLocaleString(
                "vi-VN"
              )}đ</span>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="order-footer">
          <span class="order-total">Tổng tiền: <strong>${order.total.toLocaleString(
            "vi-VN"
          )}đ</strong></span>
          ${
            order.status === "new"
              ? `
            <button class="btn-cancel-order" onclick="cancelOrder(${order.id})">
              <i class="bx bx-x"></i> Hủy đơn
            </button>
          `
              : ""
          }
        </div>
      </div>
    `;
  });

  html += "</div>";
  orderHistoryDiv.innerHTML = html;
}

// Lấy text trạng thái
function getStatusText(status) {
  const statusMap = {
    new: "Đơn mới",
    processing: "Đang xử lý",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
}

// Lấy class CSS cho trạng thái
function getStatusClass(status) {
  const classMap = {
    new: "status-new",
    processing: "status-processing",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
  };
  return classMap[status] || "";
}

// Format ngày
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Hủy đơn hàng
function cancelOrder(orderId) {
  if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex !== -1) {
    // Chỉ cho phép hủy đơn hàng có trạng thái "new"
    if (orders[orderIndex].status !== "new") {
      showToast("Không thể hủy đơn hàng này!", "error");
      return;
    }

    orders[orderIndex].status = "cancelled";
    localStorage.setItem("orders", JSON.stringify(orders));

    showToast("Đã hủy đơn hàng thành công!", "success");

    // Cập nhật lại hiển thị
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    displayOrderHistory(currentUser.username);
  }
}

function closeUserInfo() {
  document.getElementById("taiKhoan").style.display = "none";
}

function logout() {
  localStorage.removeItem("currentUser");

  const usernameDisplay = document.getElementById("usernameDisplay");
  if (usernameDisplay) {
    usernameDisplay.textContent = "";
  }

  const taiKhoanModal = document.getElementById("taiKhoan");
  if (taiKhoanModal) {
    taiKhoanModal.style.display = "none";
  }

  const userMenuIcon = document.querySelector(".icon.user-menu");
  if (userMenuIcon) {
    userMenuIcon.classList.add("disabled");
  }

  // Reset giỏ hàng khi đăng xuất
  cart = [];
  updateCartCount();
}

function saveInfo() {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    showToast("Vui lòng đăng nhập lại!", "warning");
    return;
  }

  const emailInput = document.getElementById("infoEmail");
  const phoneInput = document.getElementById("infoPhone");
  const addressInput = document.getElementById("infoAddress");

  currentUser.email = emailInput ? emailInput.value : currentUser.email;
  currentUser.phone = phoneInput ? phoneInput.value : currentUser.phone;
  currentUser.address = addressInput ? addressInput.value : currentUser.address;

  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  let accountIndex = accounts.findIndex(
    (acc) => acc.username === currentUser.username
  );

  if (accountIndex !== -1) {
    accounts[accountIndex] = currentUser;
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showToast("Lưu thông tin thành công!", "success");
  closeUserInfo();
}

let perPage = 6;
let currentPage = 1;
let totalPage = 0;

function showProductArr(productShow, startIndex = 0) {
  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  productShow.forEach((p, i) => {
    if (p.isHidden) {
      return;
    }

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="./accset/img/${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="desc">${p.desc}</p>
      <p class="price">${p.price.toLocaleString("vi-VN")}đ</p>
      <button class="btn-detail" onclick="viewDetail(${
        p.id
      })">Xem chi tiết</button>
      <button class="btn-add-cart" onclick="addToCartQuick(${p.id})">
        <i class="fa-solid fa-cart-plus"></i> Thêm
      </button>
    `;
    container.appendChild(card);
  });
}

function getFilteredProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  // Chỉ trả về sản phẩm không bị ẩn
  return products.filter((p) => !p.isHidden);
}

function displayList(productAll, perPage, currentPage) {
  let start = (currentPage - 1) * perPage;
  let end = start + perPage;
  let productShow = productAll.slice(start, end);
  showProductArr(productShow, start);
}

function setupPagination(productAll, perPage) {
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  const prevBtn = pagination.querySelector(".prev-page");
  const nextBtn = pagination.querySelector(".next-page");

  const oldNumbers = pagination.querySelectorAll(".page-number");
  oldNumbers.forEach((n) => n.remove());

  let pageCount = Math.ceil(productAll.length / perPage);
  totalPage = pageCount;

  if (pageCount <= 1) {
    pagination.style.display = "none";
    return;
  }
  pagination.style.display = "flex";

  for (let i = 1; i <= pageCount; i++) {
    const btn = paginationChange(i, productAll);
    pagination.insertBefore(btn, nextBtn);
  }

  updatePrevNextButtons();
}

function paginationChange(page, productAll) {
  let node = document.createElement("button");
  node.classList.add("page-number");
  node.textContent = page;

  if (currentPage === page) node.classList.add("active");

  node.addEventListener("click", function () {
    currentPage = page;
    displayList(productAll, perPage, currentPage);

    document
      .querySelectorAll(".page-number")
      .forEach((p) => p.classList.remove("active"));
    node.classList.add("active");

    updatePrevNextButtons();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  return node;
}

function updatePrevNextButtons() {
  const prevBtn = document.querySelector(".prev-page");
  const nextBtn = document.querySelector(".next-page");

  if (prevBtn && nextBtn) {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPage;

    prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.querySelector(".prev-page");
  const nextBtn = document.querySelector(".next-page");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPage) {
        currentPage++;
      }
    });
  }

  const products = getFilteredProducts();
  displayList(products, perPage, currentPage);
  setupPagination(products, perPage);
});

// SỬA HÀM viewDetail - thêm dataset.productId
function viewDetail(productId) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return;
  }

  const nameElement = document.getElementById("detailName");
  nameElement.textContent = product.name;
  nameElement.dataset.productId = product.id; // THÊM DÒNG NÀY

  document.getElementById("detailImg").src = `./accset/img/${product.img}`;
  document.getElementById("detailDesc").textContent = product.desc;
  document.getElementById("detailPrice").textContent =
    product.price.toLocaleString("vi-VN");
  document.getElementById("detailQuantity").textContent = product.quantity;
  document.getElementById("detailCategory").textContent = product.category;

  document.getElementById("productDetail").style.display = "block";
}

function closeDetail() {
  document.getElementById("productDetail").style.display = "none";
}

window.addEventListener("click", function (e) {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (e.target === modal) modal.style.display = "none";
  });
});

//===================Tìm kiếm=======================
let isSearchMode = false;
let originalProducts = [];

function toggleAdvancedSearch() {
  const advSearch = document.getElementById("advancedSearch");
  if (advSearch) {
    advSearch.classList.toggle("active");
  }
}

document.addEventListener("click", function (e) {
  const advSearch = document.getElementById("advancedSearch");
  const searchContainer = document.querySelector(".search-container");

  if (advSearch && searchContainer && !searchContainer.contains(e.target)) {
    advSearch.classList.remove("active");
  }
});

function searchProducts() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword) {
    showToast("Vui lòng nhập từ khóa tìm kiếm!", "warning");
    return;
  }

  const allProducts = getFilteredProducts();

  if (!isSearchMode) {
    originalProducts = [...allProducts];
  }

  const filteredProducts = originalProducts.filter((product) =>
    product.name.toLowerCase().includes(keyword)
  );

  isSearchMode = true;
  currentPage = 1;

  showSearchResults(`"${keyword}"`, filteredProducts.length);
  displayList(filteredProducts, perPage, currentPage);
  setupPagination(filteredProducts, perPage);
}

function advancedSearch() {
  const nameInput = document.getElementById("advSearchName");
  const categorySelect = document.getElementById("advSearchCategory");
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");

  if (!nameInput || !categorySelect || !minPriceInput || !maxPriceInput) return;

  const name = nameInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const minPrice = parseFloat(minPriceInput.value) || 0;
  const maxPrice = parseFloat(maxPriceInput.value) || Infinity;

  if (!name && category === "all" && minPrice === 0 && maxPrice === Infinity) {
    showToast("Vui lòng chọn ít nhất một tiêu chí tìm kiếm!", "warning");
    return;
  }

  const allProducts = getFilteredProducts();

  if (!isSearchMode) {
    originalProducts = [...allProducts];
  }

  const filteredProducts = originalProducts.filter((product) => {
    const matchName = !name || product.name.toLowerCase().includes(name);
    const matchCategory =
      category === "all" ||
      product.category.toLowerCase() === category.toLowerCase();
    const matchPrice = product.price >= minPrice && product.price <= maxPrice;

    return matchName && matchCategory && matchPrice;
  });

  isSearchMode = true;
  currentPage = 1;

  const advSearch = document.getElementById("advancedSearch");
  if (advSearch) {
    advSearch.classList.remove("active");
  }

  let searchDesc = "Tìm kiếm nâng cao";
  let criteria = [];
  if (name) criteria.push(`Tên: "${name}"`);
  if (category !== "all") criteria.push(`Loại: ${category}`);
  if (minPrice > 0 || maxPrice < Infinity) {
    criteria.push(
      `Giá: ${minPrice.toLocaleString()}-${maxPrice.toLocaleString()}đ`
    );
  }
  if (criteria.length > 0) {
    searchDesc += " (" + criteria.join(", ") + ")";
  }

  showSearchResults(searchDesc, filteredProducts.length);
  displayList(filteredProducts, perPage, currentPage);
  setupPagination(filteredProducts, perPage);
}

function filterByCategory(category) {
  const allProducts = getFilteredProducts();

  if (!isSearchMode) {
    originalProducts = [...allProducts];
  }

  let filteredProducts;
  if (category === "all") {
    filteredProducts = [...originalProducts];
  } else {
    filteredProducts = originalProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  isSearchMode = true;
  currentPage = 1;

  const categoryName = category === "all" ? "Tất cả sản phẩm" : category;
  showSearchResults(`Danh mục: ${categoryName}`, filteredProducts.length);
  displayList(filteredProducts, perPage, currentPage);
  setupPagination(filteredProducts, perPage);
}

function showSearchResults(searchText, count) {
  const section = document.getElementById("searchResultsSection");
  const title = document.getElementById("searchResultsTitle");
  const countText = document.getElementById("searchResultsCount");

  if (section && title && countText) {
    section.style.display = "block";
    title.textContent = `Kết quả: ${searchText}`;
    countText.textContent = `Tìm thấy ${count} sản phẩm`;

    const productSection = document.querySelector(".product-section");
    if (productSection) {
      productSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
}

function clearSearch() {
  if (!isSearchMode) return;

  isSearchMode = false;
  currentPage = 1;

  const section = document.getElementById("searchResultsSection");
  if (section) {
    section.style.display = "none";
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
  }

  resetSearch();

  const products = getFilteredProducts();
  displayList(products, perPage, currentPage);
  setupPagination(products, perPage);
}

function resetSearch() {
  const advSearchName = document.getElementById("advSearchName");
  const advSearchCategory = document.getElementById("advSearchCategory");
  const minPrice = document.getElementById("minPrice");
  const maxPrice = document.getElementById("maxPrice");

  if (advSearchName) advSearchName.value = "";
  if (advSearchCategory) advSearchCategory.value = "all";
  if (minPrice) minPrice.value = "";
  if (maxPrice) maxPrice.value = "";
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const keyword = this.value.trim();
      if (keyword === "") {
        const products = getFilteredProducts();
        displayList(products, perPage, currentPage);
        setupPagination(products, perPage);
        return;
      }
      searchProducts();
    });
  }

  const advSearchName = document.getElementById("advSearchName");
  if (advSearchName) {
    advSearchName.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        advancedSearch();
      }
    });
  }
});

// Giỏ hàng
let cart = [];

function loadCart() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    cart = [];
    return;
  }

  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  const user = accounts.find((acc) => acc.username === currentUser.username);
  if (user && user.cart) {
    cart = user.cart;
  } else {
    cart = [];
  }
}

function saveCart() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  const userIndex = accounts.findIndex(
    (acc) => acc.username === currentUser.username
  );
  if (userIndex !== -1) {
    accounts[userIndex].cart = cart;
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }

  updateCartCount();
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? "block" : "none";
  }
}

function addToCart() {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", "warning");
    openLogin();
    return;
  }

  const nameElement = document.getElementById("detailName");
  const productId = parseInt(nameElement.dataset.productId);

  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const product = products.find((p) => p.id === productId);

  if (!product) {
    showToast("Không tìm thấy sản phẩm!", "error");
    return;
  }

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: `./accset/img/${product.img}`, // SỬA: thêm đường dẫn đầy đủ
      quantity: 1,
    });
  }

  saveCart();
  showToast("Đã thêm sản phẩm vào giỏ hàng!", "success");
  closeDetail();
}

// Thêm nhanh vào giỏ hàng từ danh sách sản phẩm
function addToCartQuick(productId) {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", "warning");
    openLogin();
    return;
  }

  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const product = products.find((p) => p.id === productId);

  if (!product) {
    showToast("Không tìm thấy sản phẩm!", "error");
    return;
  }

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
    showToast(`Đã tăng số lượng "${product.name}" trong giỏ hàng!`, "info");
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: `./accset/img/${product.img}`,
      quantity: 1,
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, "success");
  }

  saveCart();

  // Hiệu ứng nhấp nháy icon giỏ hàng
  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    cartIcon.style.animation = "bounce 0.5s";
    setTimeout(() => {
      cartIcon.style.animation = "";
    }, 500);
  }
}

function openCart() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.style.display = "block";
    renderCart();
  }
}

function closeCart() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.style.display = "none";
  }
}

function renderCart() {
  const cartBody = document.getElementById("cartBody");
  const totalPriceElement = document.getElementById("totalPrice");

  if (!cartBody || !totalPriceElement) return;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <i class="bx bx-cart"></i>
        <p>Giỏ hàng của bạn đang trống</p>
        <button class="btn-continue" onclick="closeCart()">
          Tiếp tục mua sắm
        </button>
      </div>
    `;
    totalPriceElement.textContent = "0 đ";
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    html += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.price.toLocaleString(
            "vi-VN"
          )} đ</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-control">
            <button class="quantity-btn" onclick="decreaseQuantity(${index})" ${
      item.quantity <= 1 ? "disabled" : ""
    }>
              <i class="bx bx-minus"></i>
            </button>
            <span class="quantity-number">${item.quantity}</span>
            <button class="quantity-btn" onclick="increaseQuantity(${index})">
              <i class="bx bx-plus"></i>
            </button>
          </div>
          <button class="btn-remove" onclick="removeFromCart(${index})">
            <i class="bx bx-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  cartBody.innerHTML = html;
  totalPriceElement.textContent = total.toLocaleString("vi-VN") + " đ";
}

function increaseQuantity(index) {
  cart[index].quantity += 1;
  saveCart();
  renderCart();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
    saveCart();
    renderCart();
  }
}

function removeFromCart(index) {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }
}
function checkout() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    showToast("Vui lòng đăng nhập để thanh toán!", "warning");
    closeCart();
    openLogin();
    return;
  }

  if (cart.length === 0) {
    showToast("Giỏ hàng của bạn đang trống!", "info");
    return;
  }

  // Lấy thông tin giao hàng
  const name = document.getElementById("newName").value || currentUser.username;
  const phone = document.getElementById("newPhone").value || currentUser.phone;
  const address =
    document.getElementById("newAddress").value || currentUser.address;

  if (!name) {
    showToast("Vui lòng nhập tên người nhận!", "warning");
    document.getElementById("newName").focus();
    return;
  }

  if (name.length < 2) {
    showToast("Tên người nhận phải có ít nhất 2 ký tự!", "warning");
    document.getElementById("newName").focus();
    return;
  }

  if (!phone) {
    showToast("Vui lòng nhập số điện thoại!", "warning");
    document.getElementById("newPhone").focus();
    return;
  }

  const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
  if (!phoneRegex.test(phone)) {
    showToast(
      "Số điện thoại không hợp lệ! (VD: 0912345678 hoặc +84912345678)",
      "warning"
    );
    document.getElementById("newPhone").focus();
    return;
  }

  if (!address) {
    showToast("Vui lòng nhập địa chỉ giao hàng!", "warning");
    document.getElementById("newAddress").focus();
    return;
  }

  if (address.length < 10) {
    showToast("Địa chỉ giao hàng phải có ít nhất 10 ký tự!", "warning");
    document.getElementById("newAddress").focus();
    return;
  }

  // Lấy phương thức thanh toán
  const paymentMethod =
    document.querySelector('input[name="paymentMethod"]:checked')?.value ||
    "cod";

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const newOrderId =
    orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 101;

  const newOrder = {
    id: newOrderId,
    customer: currentUser.username,
    date: new Date().toISOString().split("T")[0],
    status: "new",
    deliveryInfo: { name, phone, address },
    paymentMethod,
    items: cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  saveCart();
  renderCart();

  showToast(
    `Đặt hàng thành công! Mã đơn: ${newOrderId}\nTổng tiền: ${newOrder.total.toLocaleString(
      "vi-VN"
    )} đ`,
    "success"
  );

  closeCart();
  closeCheckoutModal(); // đóng modal thanh toán nếu có
}

function openCheckoutModal() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    showToast("Vui lòng đăng nhập để thanh toán!", "warning");
    openLogin();
    return;
  }

  // Hiển thị modal
  const modal = document.getElementById("checkoutModal");
  modal.style.display = "block";

  // Hiển thị thông tin người dùng vào input (có thể sửa)
  document.getElementById("newName").value = currentUser.username || "";
  document.getElementById("newPhone").value = currentUser.phone || "";
  document.getElementById("newAddress").value = currentUser.address || "";

  // Hiển thị các input mới
  document.getElementById("newAddressFields").style.display = "block";
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  modal.style.display = "none";
}
