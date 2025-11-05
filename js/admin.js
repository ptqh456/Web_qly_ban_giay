window.onload = function () {
  createAccount();
  createProduct();
  createOrders();
  createImports();
  const products = getProducts();
  displayList(products, perPage, currentPage);
  setupPagination(products, perPage);
  showUsers();
  showOrderList();
  showImportList();
  initInventory();
  products.forEach((product) => {
    if (product.img.startsWith("upload_") && !uploadedImages[product.img]) {
      // Không thể khôi phục blob URL, hiển thị placeholder
      uploadedImages[product.img] = "./accset/img/placeholer.png";
    }
  });
};

// === KIỂM TRA ADMIN ĐÃ ĐĂNG NHẬP CHƯA ===
const isAdmin = localStorage.getItem("isAdminLoggedIn");
if (isAdmin === "true") {
  document.getElementById("loginForm").style.display = "none";
} else {
  document.getElementById("loginForm").style.display = "flex";
}

// === ĐĂNG NHẬP ADMIN ===
document
  .getElementById("adminLoginForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("login_username").value.trim();
    const password = document.getElementById("login_password").value.trim();

    // Tài khoản admin mẫu
    const adminAccount = {
      username: "admin",
      password: "1",
    };

    if (
      username === adminAccount.username &&
      password === adminAccount.password
    ) {
      localStorage.setItem("isAdminLoggedIn", "true");
      document.getElementById("loginForm").style.display = "none"; // ẩn form
      // Chuyển hướng trang quản trị (nếu có)
      // window.location.href = "admin.html";
    } else {
      alert("❌ Sai tên đăng nhập hoặc mật khẩu!");
    }
  });
function closeForm() {
  document.getElementById("loginForm").style.display = "none";
}
function openForm() {
  document.getElementById("loginForm").style.display = "flex";
}
function logout() {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "admin.html"; // trở về trang chính
}

// ================== KHAI BÁO BIẾN ==================
const productListEl = document.querySelector(".product-list");
const openAddBtn = document.querySelector(".btn-add-product");
const productModal = document.getElementById("productModal");
const cancelModalBtn = document.getElementById("cancelModal");
const productForm = document.getElementById("productForm");
const productFileInput = document.getElementById("productFile");
const previewImage = document.getElementById("previewImage");
const filterSelect = document.getElementById("the-loai");
const resetBtn = document.querySelector(".btn-reset-order");

let isEdit = false;
let indexCur = -1;
let currentFileName = "";

// ================== PHÂN TRANG ==================
let perPage = 5;
let currentPage = 1;
let totalPage = 0;

// ================== LOCAL STORAGE ==================
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}
function setProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}
function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}
function setOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// ================== LẤY SẢN PHẨM ĐÃ LỌC ==================
function getFilteredProducts() {
  const products = getProducts();
  const filterValue = filterSelect.value;

  // Lấy giá trị tìm kiếm
  const searchName = searchNameInput.value.toLowerCase().trim();
  const minImportPrice = parseFloat(minImportPriceInput.value) || 0;
  const maxImportPrice = parseFloat(maxImportPriceInput.value) || Infinity;
  const minProfit =
    parseFloat(minProfitInput.value.replace(",", ".")) || -Infinity;
  const maxProfit =
    parseFloat(maxProfitInput.value.replace(",", ".")) || Infinity;

  return products.filter((p) => {
    // Lọc theo loại
    if (filterValue !== "all" && p.category !== filterValue) {
      return false;
    }

    // Lọc theo tên
    if (searchName && !p.name.toLowerCase().includes(searchName)) {
      return false;
    }

    // Lọc theo giá vốn
    if (p.importPrice < minImportPrice || p.importPrice > maxImportPrice) {
      return false;
    }

    // Lọc theo % lợi nhuận
    const profitPercent = calculateProfitPercent(p.price, p.importPrice);
    if (profitPercent < minProfit || profitPercent > maxProfit) {
      return false;
    }

    return true;
  });
}

// Cập nhật sự kiện nút Làm Mới
resetBtn.addEventListener("click", () => {
  // Reset dropdown thể loại
  filterSelect.value = "all";

  // Reset các trường tìm kiếm
  searchNameInput.value = "";
  minImportPriceInput.value = "";
  maxImportPriceInput.value = "";
  minProfitInput.value = "";
  maxProfitInput.value = "";

  // Reset trang về 1
  currentPage = 1;

  // Hiển thị lại tất cả sản phẩm
  const products = getProducts();
  displayList(products, perPage, currentPage);
  setupPagination(products, perPage);
});

filterSelect.addEventListener("change", function () {
  currentPage = 1; // Reset về trang 1
  const filtered = getFilteredProducts();
  displayList(filtered, perPage, currentPage);
  setupPagination(filtered, perPage);
});

function getFilteredOrders() {
  const orders = getOrders();
  const fdate = document.getElementById("fromDate").value;
  const tdate = document.getElementById("toDate").value;
  const status = document.getElementById("orderStatus").value;

  return orders.filter((o) => {
    const orderDate = new Date(o.date);
    const fromDate = fdate ? new Date(fdate) : null;
    const toDate = tdate ? new Date(tdate) : null;

    let matchDate = true;

    if (fromDate && toDate) {
      matchDate = orderDate >= fromDate && orderDate <= toDate;
    } else if (fromDate) {
      matchDate = orderDate >= fromDate;
    } else if (toDate) {
      matchDate = orderDate <= toDate;
    }

    let matchStatus = status ? o.status === status : true;

    return matchDate && matchStatus;
  });
}
document.getElementById("fromDate").addEventListener("input", showOrderList);
document.getElementById("toDate").addEventListener("input", showOrderList);
document
  .getElementById("orderStatus")
  .addEventListener("change", showOrderList);

document.querySelector(".menu-icon-btn").addEventListener("click", () => {
  const sidebar = document.querySelector(".sidebar");
  const content = document.querySelector(".content");

  sidebar.classList.toggle("close");
  content.classList.toggle("expanded");
});

// ================== HIỂN THỊ DANH SÁCH SẢN PHẨM (CÓ PHÂN TRANG) ==================
function displayList(productAll, perPage, currentPage) {
  let start = (currentPage - 1) * perPage;
  let end = (currentPage - 1) * perPage + perPage;
  let productShow = productAll.slice(start, end);
  showProductArr(productShow, start);
}
function showProductArr(products, startIndex = 0) {
  productListEl.innerHTML = "";

  if (products.length === 0) {
    productListEl.innerHTML = `
      <div style="text-align: center; padding: 50px; color: #999;">
        <i class="fa-solid fa-box-open" style="font-size: 70px; margin: 20px;"></i>
        <p>Chưa có sản phẩm nào</p>
      </div>
    `;
    document.querySelector(".pagination").style.display = "none";
    return;
  }

  document.querySelector(".pagination").style.display = "flex";

  products.forEach((item, index) => {
    const actualIndex = startIndex + index;

    // ✅ KIỂM TRA: Nếu bắt đầu bằng "upload_" thì dùng blob URL
    let imgSrc;
    if (item.img.startsWith("upload_")) {
      imgSrc = uploadedImages[item.img] || "./accset/img/placeholer.png";
    } else {
      imgSrc = `./accset/img/${item.img}`;
    }

    productListEl.innerHTML += `
      <div class="product-item">
        <div class="product-left">
          <img src="${imgSrc}" 
               alt="${item.name}"
               onerror="this.src='./accset/img/placeholer.png'">
          <div class="product-info">
            <h4>${item.name}</h4>
            <p class="product-desc">${item.desc}</p>
            <span class="product-category">${item.category}</span>
          </div>
        </div>
        <div class="product-right">
          <div class="product-price">
            Giá bán: ${parseInt(item.price).toLocaleString()}đ
          </div>
          <div class="product-cost">
            Giá vốn: ${parseInt(item.importPrice).toLocaleString()}đ
          </div>
          <div class="product-profit">
            % Lợi nhuận: ${(
              ((item.price - item.importPrice) / item.importPrice) *
              100
            ).toFixed(2)}%
          </div>
          <div class="product-actions">
              <button class="btn-hide" onclick="toggleHide(${actualIndex})">
              ${
                item.isHidden
                  ? '<i class="fa-solid fa-eye-slash"></i>'
                  : '<i class="fa-solid fa-eye"></i>'
              }
            </button>
            <button class="btn-edit" onclick="editProduct(${actualIndex})">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="btn-delete" onclick="deleteProduct(${actualIndex})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function showUsers() {
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const tableBody = document.querySelector("#userTable tbody");
  tableBody.innerHTML = "";

  const userAccounts = accounts.filter((acc) => acc.role === "user");

  if (userAccounts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:20px; color:#999;">
          <i class="fa-solid fa-user-slash" style="font-size:50px;"></i>
          <p>Không có tài khoản người dùng nào</p>
        </td>
      </tr>
    `;
    return;
  }

  userAccounts.forEach((acc, index) => {
    const statusClass = acc.status === 1 ? "active" : "locked";
    const statusText = acc.status === 1 ? "Hoạt động" : "Đã khóa";

    const actionButtons = `
      ${
        acc.status === 1
          ? `<button class="lock-btn" onclick="lockUser(${index})">
               <i class="fa-solid fa-lock"></i>
             </button>`
          : `<button class="unlock-btn" onclick="unlockUser(${index})">
               <i class="fa-solid fa-lock-open"></i>
             </button>`
      }
      <button class="reset-btn" onclick="resetPassword(${index})">
        <i class="fa-solid fa-rotate"></i> Reset MK
      </button>
    `;

    tableBody.innerHTML += `
      <tr>
        <td>${acc.username}</td>
        <td>${acc.email}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>${actionButtons}</td>
      </tr>
    `;
  });
}

function showOrderList() {
  const orders = getFilteredOrders();
  const tableBody = document.querySelector("#orderTable tbody");
  tableBody.innerHTML = "";

  if (orders.length === 0) {
    tableBody.innerHTML = `<tr>
      <td colspan="5" style="text-align:center; padding:20px; color:#999;">Không có đơn hàng nào</td>
    </tr>`;
    return;
  }

  orders.forEach((order) => {
    const statusClass = order.status;
    const statusText = {
      new: "Mới đặt",
      processing: "Đã xử lý",
      delivered: "Đã giao",
      cancelled: "Hủy",
    }[order.status];

    const total = order.items
      ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      : order.total || 0;

    tableBody.innerHTML += `
      <tr>
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td>${order.date}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>${total.toLocaleString()}đ</td>
        <td>${order.paymentMethod}</td>
        <td>
          <button class="details-btn" onclick="showOrderDetail(${
            order.id
          })">Chi tiết</button>
          <button class="new-btn" onclick="updateOrderStatus('${
            order.id
          }','new')">Mới đặt</button>
          <button class="process-btn" onclick="updateOrderStatus('${
            order.id
          }','processing')">Xử lý</button>
          <button class="delivered-btn" onclick="updateOrderStatus('${
            order.id
          }','delivered')">Giao</button>
          <button class="cancel-btn" onclick="updateOrderStatus('${
            order.id
          }','cancelled')">Hủy</button>
        </td>
      </tr>
    `;
  });
}

function updateOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const index = orders.findIndex((o) => o.id == orderId);
  if (index !== -1) {
    orders[index].status = newStatus;
    localStorage.setItem("orders", JSON.stringify(orders));
    showOrderList(); // refresh bảng
  }
}

function showOrderDetail(orderId) {
  const orders = getOrders();
  const order = orders.find((o) => o.id == orderId);
  if (!order) return;

  document.getElementById("orderId").textContent = order.id;
  document.getElementById("orderCustomer").textContent = order.customer;
  document.getElementById("orderDate").textContent = order.date;
  document.getElementById("orderStatusDetail").textContent =
    {
      new: "Mới đặt",
      processing: "Đã xử lý",
      delivered: "Đã giao",
      cancelled: "Hủy",
    }[order.status] || "Không xác định";
  document.getElementById("orderTotal").textContent =
    (order.total || 0).toLocaleString() + "đ";

  const tbody = document.querySelector("#orderProducts tbody");
  tbody.innerHTML = "";

  // ✅ Sửa lại điều kiện ở đây
  if (order.items && order.items.length > 0) {
    let total = 0;
    order.items.forEach((p) => {
      const amount = p.price * p.quantity;
      total += amount;
      tbody.innerHTML += `
        <tr>
          <td>${p.name}</td>
          <td>${p.price.toLocaleString()}đ</td>
          <td>${p.quantity}</td>
          <td>${amount.toLocaleString()}đ</td>
        </tr>
      `;
    });
    document.getElementById("orderTotal").textContent =
      total.toLocaleString() + "đ";
  } else {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Chưa có sản phẩm</td></tr>`;
    document.getElementById("orderTotal").textContent =
      (order.total || 0).toLocaleString() + "đ";
  }

  document.getElementById("orderDetailModal").style.display = "flex";
}
document.getElementById("closeOrderDetail").onclick = function () {
  document.getElementById("orderDetailModal").style.display = "none";
};

// ============= PHẦN 1 Hiển thị danh sách phiếu nhập =============
function showImportList() {
  const imports = JSON.parse(localStorage.getItem("imports")) || [];
  const tbody = document.querySelector("#importTable tbody");
  tbody.innerHTML = "";

  imports.forEach((imp) => {
    const statusText = imp.status === "completed" ? "Hoàn thành" : "Đang nhập";
    const statusClass =
      imp.status === "completed" ? "status-completed" : "status-pending";

    const actionButtons =
      imp.status === "in-progress"
        ? `
        <button class="view-btn" onclick="showImportDetail(${imp.id})">
          <i class="fa-solid fa-eye"></i> Xem
        </button>
        <button class="complete-btn" onclick="completeImport(${imp.id})">
          <i class="fa-solid fa-check"></i> Hoàn thành
        </button>
        <button class="delete-btn" onclick="deleteImport(${imp.id})">
          <i class="fa-solid fa-trash"></i> Xóa
        </button>
      `
        : `
        <button class="view-btn" onclick="showImportDetail(${imp.id})">
          <i class="fa-solid fa-eye"></i> Xem
        </button>
      `;

    tbody.innerHTML += `
      <tr>
        <td>${imp.id}</td>
        <td>${imp.date}</td>
        <td>${imp.total.toLocaleString()}đ</td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td class="action-buttons">${actionButtons}</td>
      </tr>
    `;
  });
}

// ============= PHẦN 3: Xóa phiếu nhập =============
function deleteImport(importId) {
  if (confirm("Bạn có chắc muốn xóa phiếu nhập này?")) {
    let imports = JSON.parse(localStorage.getItem("imports")) || [];
    imports = imports.filter((i) => i.id != importId);
    localStorage.setItem("imports", JSON.stringify(imports));
    showImportList();
  }
}

// ============= PHẦN 4: Hoàn thành phiếu nhập =============
function completeImport(importId) {
  const imports = JSON.parse(localStorage.getItem("imports")) || [];
  const imp = imports.find((i) => i.id == importId);

  if (imp) {
    imp.status = "completed";

    // Cập nhật số lượng sản phẩm trong kho
    const products = JSON.parse(localStorage.getItem("products")) || [];
    imp.items.forEach((item) => {
      const product = products.find((p) => p.id == item.productId);
      if (product) {
        product.quantity = (product.quantity || 0) + item.quantity;
      }
    });

    localStorage.setItem("imports", JSON.stringify(imports));
    localStorage.setItem("products", JSON.stringify(products));
    showImportList();
  }
}

// ============= PHẦN 5: Thêm phiếu nhập mới =============
let isAdd = false;
let selectedProducts = []; // Lưu danh sách sản phẩm được chọn khi thêm mới

function showImportDetail(importId) {
  const imports = JSON.parse(localStorage.getItem("imports")) || [];

  // Nếu không truyền importId => Chế độ THÊM MỚI
  if (!importId) {
    isAdd = true;
    selectedProducts = [];

    document.getElementById("importId").textContent = "Mới";
    document.getElementById("importDate").value = new Date()
      .toISOString()
      .split("T")[0];
    document.getElementById("importStatus").value = "in-progress";
    document.getElementById("importTotal").textContent = "0đ";

    document.querySelector("#importProducts tbody").innerHTML = "";

    document.getElementById("addImportDetail").style.display = "inline-block";
    document.getElementById("saveImportDetail").style.display = "none";

    setupAddImportHandlers();
    document.getElementById("importDetailModal").style.display = "flex";
    return;
  }

  // Chế độ XEM/SỬA
  isAdd = false;
  const imp = imports.find((i) => i.id == importId);
  if (!imp) return;

  document.getElementById("addImportDetail").style.display = "none";
  document.getElementById("saveImportDetail").style.display = "inline-block";

  document.getElementById("importId").textContent = imp.id;
  document.getElementById("importDate").value = imp.date;
  document.getElementById("importStatus").value = imp.status;
  document.getElementById("importTotal").textContent =
    imp.total.toLocaleString() + "đ";

  if (imp.status === "completed") {
    document.getElementById("saveImportDetail").style.display = "none";
  }

  const tbody = document.querySelector("#importProducts tbody");
  tbody.innerHTML = "";

  imp.items.forEach((p, index) => {
    const deleteBtn =
      imp.status === "in-progress"
        ? `<button class="delete-btn-small" onclick="removeImportItem(${index})"><i class="fa-solid fa-trash"></i></button>`
        : "";

    tbody.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td><input type="number" id="price-${index}" value="${
      p.importPrice
    }" min="0" ${imp.status === "completed" ? "disabled" : ""}></td>
        <td><input type="number" id="qty-${index}" value="${
      p.quantity
    }" min="1" ${imp.status === "completed" ? "disabled" : ""}></td>
        <td id="amount-${index}">${(
      p.importPrice * p.quantity
    ).toLocaleString()}đ</td>
        <td>${deleteBtn}</td>
      </tr>
    `;
  });

  // Chỉ cho phép chỉnh sửa nếu status = in-progress
  if (imp.status === "in-progress") {
    imp.items.forEach((p, index) => {
      const priceInput = document.getElementById(`price-${index}`);
      const qtyInput = document.getElementById(`qty-${index}`);

      const updateAmountAndTotal = () => {
        const newPrice = parseFloat(priceInput.value) || 0;
        const newQty = parseInt(qtyInput.value) || 0;
        const newAmount = newPrice * newQty;

        document.getElementById(`amount-${index}`).textContent =
          newAmount.toLocaleString() + "đ";

        let total = 0;
        imp.items.forEach((_, i) => {
          const price =
            parseFloat(document.getElementById(`price-${i}`).value) || 0;
          const qty = parseInt(document.getElementById(`qty-${i}`).value) || 0;
          total += price * qty;
        });
        document.getElementById("importTotal").textContent =
          total.toLocaleString() + "đ";
      };

      priceInput.addEventListener("input", updateAmountAndTotal);
      qtyInput.addEventListener("input", updateAmountAndTotal);
    });
  }

  document.getElementById("importDetailModal").style.display = "flex";

  // Lưu chỉnh sửa
  document.getElementById("saveImportDetail").onclick = function () {
    let total = 0;
    imp.items.forEach((p, index) => {
      const newPrice =
        parseFloat(document.getElementById(`price-${index}`).value) || 0;
      const newQty =
        parseInt(document.getElementById(`qty-${index}`).value) || 0;
      p.importPrice = newPrice;
      p.quantity = newQty;
      total += newPrice * newQty;
    });
    imp.total = total;
    imp.date = document.getElementById("importDate").value;
    imp.status = document.getElementById("importStatus").value;

    localStorage.setItem("imports", JSON.stringify(imports));
    document.getElementById("importDetailModal").style.display = "none";
    showImportList();
  };

  document.getElementById("cancelImportDetail").onclick = function () {
    document.getElementById("importDetailModal").style.display = "none";
  };
}

// ============= Xóa sản phẩm khỏi phiếu nhập =============
function removeImportItem(index) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

  const importId = document.getElementById("importId").textContent;
  const imports = JSON.parse(localStorage.getItem("imports")) || [];
  const imp = imports.find((i) => i.id == importId);

  if (imp && imp.status === "in-progress") {
    imp.items.splice(index, 1);
    imp.total = imp.items.reduce(
      (sum, item) => sum + item.importPrice * item.quantity,
      0
    );
    localStorage.setItem("imports", JSON.stringify(imports));
    showImportDetail(importId);
  }
}

// ============= Thêm sản phẩm vào phiếu nhập =============
function setupAddImportHandlers() {
  document.getElementById("btn-add-sp").onclick = function () {
    showProductSelectionModal();
  };

  document.getElementById("addImportDetail").onclick = function () {
    if (selectedProducts.length === 0) {
      alert("thêm ít nhất 1 sản phẩm!");
      return;
    }

    const imports = JSON.parse(localStorage.getItem("imports")) || [];
    const newId =
      imports.length > 0 ? Math.max(...imports.map((i) => i.id)) + 1 : 201;

    const newImport = {
      id: newId,
      date: document.getElementById("importDate").value,
      status: document.getElementById("importStatus").value,
      items: selectedProducts,
      total: selectedProducts.reduce(
        (sum, item) => sum + item.importPrice * item.quantity,
        0
      ),
    };

    imports.push(newImport);
    localStorage.setItem("imports", JSON.stringify(imports));

    document.getElementById("importDetailModal").style.display = "none";
    showImportList();
  };
}

// ============= PHẦN 8: Modal chọn sản phẩm  =============
function showProductSelectionModal() {
  const products = JSON.parse(localStorage.getItem("products")) || [];

  let html = `
    <div style="margin: 10px 0;">
      <label>Chọn sản phẩm:</label>
      <select id="selectProduct">
        <option value="">-- Chọn sản phẩm --</option>
        ${products
          .map((p) => `<option value="${p.id}">${p.name}</option>`)
          .join("")}
      </select>
    </div>
    <div style="margin: 10px 0;">
      <label>Giá nhập:</label>
      <input type="number" id="inputImportPrice" min="0" >
    </div>
    <div>
      <label>Số lượng:</label>
      <input type="number" id="inputImportQty" min="1" value="1" ">
    </div>
    <button onclick="addProductToImport()" style="margin: 10px;" class="add-btn"><i class="fa-solid fa-plus"></i>Thêm vào phiếu</button>
  `;

  const tbody = document.querySelector("#importProducts tbody");
  tbody.innerHTML += `
    <tr id="add-product-row">
      <td colspan="5">${html}</td>
    </tr>
  `;
}

function addProductToImport() {
  const productId = document.getElementById("selectProduct").value;
  const importPrice = parseFloat(
    document.getElementById("inputImportPrice").value
  );
  const quantity = parseInt(document.getElementById("inputImportQty").value);

  if (!productId || !importPrice || !quantity) {
    alert("⚠️ Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find((p) => p.id == productId);

  if (!product) return;

  // Kiểm tra xem sản phẩm đã có trong danh sách chưa
  const existingIndex = selectedProducts.findIndex(
    (p) => p.productId == productId
  );
  if (existingIndex !== -1) {
    selectedProducts[existingIndex].quantity += quantity;
    selectedProducts[existingIndex].importPrice = importPrice;
  } else {
    selectedProducts.push({
      productId: product.id,
      name: product.name,
      quantity: quantity,
      importPrice: importPrice,
    });
  }

  // Cập nhật hiển thị
  renderSelectedProducts();

  const row = document.getElementById("add-product-row");
  if (row) row.remove();
}

function renderSelectedProducts() {
  const tbody = document.querySelector("#importProducts tbody");
  tbody.innerHTML = "";

  selectedProducts.forEach((p, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td><input type="number" id="price-${index}" value="${
      p.importPrice
    }" min="0" style="width:90px"></td>
        <td><input type="number" id="qty-${index}" value="${
      p.quantity
    }" min="1" style="width:60px"></td>
        <td id="amount-${index}">${(
      p.importPrice * p.quantity
    ).toLocaleString()}đ</td>
        <td><button class="delete-btn-small" onclick="removeSelectedProduct(${index})"><i class="fa-solid fa-trash"></i></button></td>
      </tr>
    `;
  });

  // Gán sự kiện real-time
  selectedProducts.forEach((p, index) => {
    const priceInput = document.getElementById(`price-${index}`);
    const qtyInput = document.getElementById(`qty-${index}`);

    const updateTotal = () => {
      const newPrice = parseFloat(priceInput.value) || 0;
      const newQty = parseInt(qtyInput.value) || 0;

      selectedProducts[index].importPrice = newPrice;
      selectedProducts[index].quantity = newQty;

      document.getElementById(`amount-${index}`).textContent =
        (newPrice * newQty).toLocaleString() + "đ";

      const total = selectedProducts.reduce(
        (sum, item) => sum + item.importPrice * item.quantity,
        0
      );
      document.getElementById("importTotal").textContent =
        total.toLocaleString() + "đ";
    };

    priceInput.addEventListener("input", updateTotal);
    qtyInput.addEventListener("input", updateTotal);
  });

  // Cập nhật tổng
  const total = selectedProducts.reduce(
    (sum, item) => sum + item.importPrice * item.quantity,
    0
  );
  document.getElementById("importTotal").textContent =
    total.toLocaleString() + "đ";
}

function removeSelectedProduct(index) {
  selectedProducts.splice(index, 1);
  renderSelectedProducts();
}

window.addEventListener("click", function (e) {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (e.target === modal) modal.style.display = "none";
  });
});

// ================== ĐÓNG MODAL CHI TIẾT ==================
function closeOrderDetail() {
  const detailModal = document.getElementById("orderDetailModal");
  detailModal.style.display = "none";
}

// ================== THIẾT LẬP PHÂN TRANG ==================
function setupPagination(productAll, perPage) {
  const pagination = document.querySelector(".pagination");
  const prevBtn = pagination.querySelector(".prev-page");
  const nextBtn = pagination.querySelector(".next-page");

  // Xóa các nút số cũ (giữ lại prev và next)
  const oldPageNumbers = pagination.querySelectorAll(".page-number");
  oldPageNumbers.forEach((btn) => btn.remove());

  let page_count = Math.ceil(productAll.length / perPage);
  totalPage = page_count;

  if (page_count <= 1) {
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";

  // Tạo các nút số trang
  for (let i = 1; i <= page_count; i++) {
    let btn = paginationChange(i, productAll);
    pagination.insertBefore(btn, nextBtn); // Chèn trước nút Next
  }

  updatePrevNextButtons();
}

function paginationChange(page, productAll) {
  let node = document.createElement("button");
  node.classList.add("page-number");
  node.textContent = page;

  if (currentPage === page) {
    node.classList.add("active");
  }

  node.addEventListener("click", function () {
    currentPage = page;
    displayList(productAll, perPage, currentPage);

    // Remove active từ tất cả
    let allPages = document.querySelectorAll(".page-number");
    allPages.forEach((p) => p.classList.remove("active"));

    // Add active vào trang hiện tại
    node.classList.add("active");

    updatePrevNextButtons();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  return node;
}

// =================== Khóa/Mở Reset pass ====================

function lockUser(index) {
  const accounts = JSON.parse(localStorage.getItem("accounts"));
  const users = accounts.filter((acc) => acc.role === "user");

  users[index].status = 0;

  // Ghi ngược lại vào mảng accounts gốc
  let userCount = 0;
  accounts.forEach((acc) => {
    if (acc.role === "user") {
      acc.status = users[userCount].status;
      userCount++;
    }
  });

  localStorage.setItem("accounts", JSON.stringify(accounts));
  showUsers();
}

function unlockUser(index) {
  const accounts = JSON.parse(localStorage.getItem("accounts"));
  const users = accounts.filter((acc) => acc.role === "user");

  users[index].status = 1;

  let userCount = 0;
  accounts.forEach((acc) => {
    if (acc.role === "user") {
      acc.status = users[userCount].status;
      userCount++;
    }
  });

  localStorage.setItem("accounts", JSON.stringify(accounts));
  showUsers();
}

function resetPassword(index) {
  const accounts = JSON.parse(localStorage.getItem("accounts"));
  const users = accounts.filter((acc) => acc.role === "user");

  users[index].password = "123456";

  let userCount = 0;
  accounts.forEach((acc) => {
    if (acc.role === "user") {
      acc.password = users[userCount].password;
      userCount++;
    }
  });

  localStorage.setItem("accounts", JSON.stringify(accounts));
  alert(`✅ Đã đặt lại mật khẩu cho ${users[index].username}`);
  showUsers();
}

// ================== CẬP NHẬT NÚT PREV/NEXT ==================
function updatePrevNextButtons() {
  const prevBtn = document.querySelector(".prev-page");
  const nextBtn = document.querySelector(".next-page");

  // Prev button
  if (currentPage === 1) {
    prevBtn.disabled = true;
    prevBtn.style.opacity = "0.5";
  } else {
    prevBtn.disabled = false;
    prevBtn.style.opacity = "1";
  }

  // Next button
  if (currentPage === totalPage) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = "0.5";
  } else {
    nextBtn.disabled = false;
    nextBtn.style.opacity = "1";
  }
}

// ================== XỬ LÝ NÚT PREV/NEXT ==================
document.querySelector(".prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    const filtered = getFilteredProducts();
    displayList(filtered, perPage, currentPage);
    setupPagination(filtered, perPage);
  }
});

document.querySelector(".next-page").addEventListener("click", () => {
  if (currentPage < totalPage) {
    currentPage++;
    const filtered = getFilteredProducts();
    displayList(filtered, perPage, currentPage);
    setupPagination(filtered, perPage);
  }
});

// ================== XÓA ẨN SẢN PHẨM ==================
function deleteProduct(index) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

  const products = getProducts();
  products.splice(index, 1);
  setProducts(products);

  // Điều chỉnh trang nếu cần
  const filtered = getFilteredProducts();
  const newTotalPages = Math.ceil(filtered.length / perPage);

  if (currentPage > newTotalPages && newTotalPages > 0) {
    currentPage = newTotalPages;
  }
  if (filtered.length === 0) {
    currentPage = 1;
  }

  displayList(filtered, perPage, currentPage);
  setupPagination(filtered, perPage);
}

function toggleHide(index) {
  const products = getProducts();
  products[index].isHidden = !products[index].isHidden;
  setProducts(products);
  const filtered = getFilteredProducts();
  displayList(filtered, perPage, currentPage);
  setupPagination(filtered, perPage);
}

// ================== CHỌN ẢNH & PREVIEW ==================
const uploadedImages = {};
productFileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    // Tạo blob URL
    const blobUrl = URL.createObjectURL(file);
    previewImage.src = blobUrl;

    // ✅ Đánh dấu là ảnh upload bằng prefix
    currentFileName = `upload_${Date.now()}_${file.name}`;

    // Lưu blob URL vào memory
    uploadedImages[currentFileName] = blobUrl;
  } else {
    alert("Vui lòng chọn file ảnh!");
    productFileInput.value = "";
    currentFileName = "";
  }
});

// ================== THÊM / SỬA SẢN PHẨM ==================
const priceInput = document.getElementById("productPrice");
const profitInput = document.getElementById("productProfitPercent");
const importInput = document.getElementById("productImportPrice");

priceInput.addEventListener("input", () => {
  const importPrice = Number(importInput.value);
  const price = Number(priceInput.value);
  if (importPrice > 0) {
    const profitPercent = ((price - importPrice) / importPrice) * 100;
    profitInput.value = profitPercent.toFixed(2);
  }
});

profitInput.addEventListener("input", () => {
  const importPrice = Number(importInput.value);
  const profitPercent = Number(profitInput.value);
  if (importPrice > 0) {
    const price = importPrice * (1 + profitPercent / 100);
    priceInput.value = Math.round(price);
  }
});

productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const importPrice = Number(
    document.getElementById("productImportPrice").value.trim()
  );
  let profitPercent = document
    .getElementById("productProfitPercent")
    .value.replace(",", ".");
  profitPercent = Number(profitPercent);

  let price = Number(document.getElementById("productPrice").value.trim());

  let profitPercentCalc = profitPercent;
  if (!profitPercent && price) {
    profitPercentCalc = ((price - importPrice) / importPrice) * 100;
  }

  if (!name || !importPrice) {
    alert("Vui lòng nhập đầy đủ tên và giá sản phẩm!");
    return;
  }

  const products = getProducts();
  const newId =
    products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const productData = {
    id: isEdit ? products[indexCur].id : newId,
    name: name,
    category: document.getElementById("productType").value,
    price: Math.round(price),
    importPrice: importPrice,
    profitPercent: parseFloat(profitPercentCalc.toFixed(2)),
    desc: document.getElementById("productDesc").value.trim(),
    img: currentFileName || "placeholer.png", // ✅ Chỉ lưu tên file
    isHidden: isEdit ? products[indexCur].isHidden : false,
  };

  if (isEdit) {
    products[indexCur] = productData;
  } else {
    products.push(productData);
    currentPage = Math.ceil(products.length / perPage);
  }

  setProducts(products);

  const filtered = getFilteredProducts();
  displayList(filtered, perPage, currentPage);
  setupPagination(filtered, perPage);

  closeModal();
});

// ================== EDIT SẢN PHẨM ==================
function editProduct(index) {
  const products = getProducts();
  const product = products[index];

  document.getElementById("productName").value = product.name;
  document.getElementById("productType").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productImportPrice").value = product.importPrice;

  const profitPercent =
    product.profitPercent !== undefined
      ? product.profitPercent
      : ((product.price - product.importPrice) / product.importPrice) * 100;

  document.getElementById("productProfitPercent").value =
    profitPercent.toFixed(2);
  document.getElementById("productDesc").value = product.desc;

  // ✅ Kiểm tra loại ảnh
  if (product.img.startsWith("upload_")) {
    previewImage.src =
      uploadedImages[product.img] || "./accset/img/placeholer.png";
  } else {
    previewImage.src = `./accset/img/${product.img}`;
  }

  currentFileName = product.img;

  productModal.style.display = "flex";
  isEdit = true;
  indexCur = index;
}

// ================== TRA CỨU SẢN PHẨM ==================

// Lắng nghe sự kiện input real-time cho tất cả các trường tìm kiếm
const searchNameInput = document.getElementById("searchName");
const minImportPriceInput = document.getElementById("minImportPrice");
const maxImportPriceInput = document.getElementById("maxImportPrice");
const minProfitInput = document.getElementById("minProfit");
const maxProfitInput = document.getElementById("maxProfit");

// Tính % lợi nhuận
function calculateProfitPercent(price, importPrice) {
  if (importPrice === 0) return 0;
  return ((price - importPrice) / importPrice) * 100;
}

// Hàm tìm kiếm và lọc sản phẩm
function searchAndFilterProducts() {
  const products = getProducts();

  // Lấy giá trị tìm kiếm
  const searchName = searchNameInput.value.toLowerCase().trim();
  const minImportPrice = parseFloat(minImportPriceInput.value) || 0;
  const maxImportPrice = parseFloat(maxImportPriceInput.value) || Infinity;
  const minProfit =
    parseFloat(minProfitInput.value.replace(",", ".")) || -Infinity;
  const maxProfit =
    parseFloat(maxProfitInput.value.replace(",", ".")) || Infinity;

  // Lọc theo thể loại (dropdown hiện tại)
  const filterValue = filterSelect.value;

  const filtered = products.filter((product) => {
    // Lọc theo loại (từ dropdown)
    if (filterValue !== "all" && product.category !== filterValue) {
      return false;
    }

    // Lọc theo tên sản phẩm
    if (searchName && !product.name.toLowerCase().includes(searchName)) {
      return false;
    }

    // Lọc theo giá vốn
    if (
      product.importPrice < minImportPrice ||
      product.importPrice > maxImportPrice
    ) {
      return false;
    }

    // Lọc theo % lợi nhuận
    const profitPercent = calculateProfitPercent(
      product.price,
      product.importPrice
    );
    if (profitPercent < minProfit || profitPercent > maxProfit) {
      return false;
    }

    return true;
  });

  // Reset về trang 1 khi tìm kiếm
  currentPage = 1;

  // Hiển thị kết quả
  displayList(filtered, perPage, currentPage);
  setupPagination(filtered, perPage);
}

// Gắn sự kiện tìm kiếm real-time
searchNameInput.addEventListener("input", searchAndFilterProducts);
minImportPriceInput.addEventListener("input", searchAndFilterProducts);
maxImportPriceInput.addEventListener("input", searchAndFilterProducts);
minProfitInput.addEventListener("input", searchAndFilterProducts);
maxProfitInput.addEventListener("input", searchAndFilterProducts);

// Cập nhật lại hàm getFilteredProducts để tích hợp tìm kiếm

// ================== MỞ / ĐÓNG MODAL ==================
openAddBtn.addEventListener("click", () => {
  productForm.reset();
  previewImage.src = "./accset/img/placeholer.png";
  currentFileName = "";
  isEdit = false;
  indexCur = -1;
  productModal.style.display = "flex";
});

cancelModalBtn.addEventListener("click", () => {
  closeModal();
});
// hàm này ko cần
productModal.addEventListener("click", (e) => {
  if (e.target === productModal) {
    closeModal();
  }
});

function closeModal() {
  productModal.style.display = "none";
  productForm.reset();
  previewImage.src = "./accset/img/placeholer.png";
  currentFileName = "";
  isEdit = false;
  indexCur = -1;
}

// ================== XỬ LÝ TAB MENU ==================
const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
const sections = document.querySelectorAll(".tab-section");
sidebarLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    sections.forEach((sec) => sec.classList.remove("active"));
    sidebarLinks.forEach((l) => l.classList.remove("active"));

    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.classList.add("active");
      link.classList.add("active");
    }
  });
});

// ================== TÌM KIẾM USER THEO THỜI GIAN THỰC ==================
const searchUserInput = document.getElementById("searchUser");
searchUserInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase().trim();
  searchAndDisplayUsers(searchValue);
});

// ================== HÀM TÌM KIẾM VÀ HIỂN THỊ USER ==================
function searchAndDisplayUsers(searchValue) {
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const tableBody = document.querySelector("#userTable tbody");
  tableBody.innerHTML = "";

  let userAccounts = accounts.filter((acc) => acc.role === "user");

  // Tìm kiếm theo tên, email
  if (searchValue) {
    userAccounts = userAccounts.filter(
      (acc) =>
        acc.username.toLowerCase().includes(searchValue) ||
        acc.email.toLowerCase().includes(searchValue)
    );
  }

  if (userAccounts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:20px; color:#999;">
          <i class="fa-solid fa-user-slash" style="font-size:50px;"></i>
          <p>${
            searchValue
              ? "Không tìm thấy khách hàng phù hợp"
              : "Không có tài khoản người dùng nào"
          }</p>
        </td>
      </tr>
    `;
    return;
  }

  userAccounts.forEach((acc, index) => {
    // Tìm index thực trong mảng accounts gốc
    const realIndex = accounts.findIndex(
      (a) => a.username === acc.username && a.role === "user"
    );

    const statusClass = acc.status === 1 ? "active" : "locked";
    const statusText = acc.status === 1 ? "Hoạt động" : "Đã khóa";

    const actionButtons = `
      ${
        acc.status === 1
          ? `<button class="lock-btn" onclick="lockUser('${acc.username}')">
               <i class="fa-solid fa-lock-open"></i>
             </button>`
          : `<button class="unlock-btn" onclick="unlockUser('${acc.username}')">
               <i class="fa-solid fa-lock"></i>
             </button>`
      }
      <button class="reset-btn" onclick="resetPassword('${acc.username}')">
        <i class="fa-solid fa-rotate"></i> Reset MK
      </button>
    `;

    // Highlight từ khóa tìm kiếm
    let displayName = acc.username;
    let displayEmail = acc.email;

    if (searchValue) {
      const regex = new RegExp(`(${searchValue})`, "gi");
      displayName = acc.username.replace(regex, "<mark>$1</mark>");
      displayEmail = acc.email.replace(regex, "<mark>$1</mark>");
    }

    tableBody.innerHTML += `
      <tr>
        <td>${displayName}</td>
        <td>${displayEmail}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>${actionButtons}</td>
      </tr>
    `;
  });
}

// ================== CẬP NHẬT CÁC HÀM XỬ LÝ USER ==================
function showUsers() {
  searchUserInput.value = ""; // Reset ô tìm kiếm
  searchAndDisplayUsers(""); // Hiển thị tất cả
}

function lockUser(username) {
  const accounts = JSON.parse(localStorage.getItem("accounts"));
  const userIndex = accounts.findIndex(
    (acc) => acc.username === username && acc.role === "user"
  );

  if (userIndex !== -1) {
    accounts[userIndex].status = 0;
    localStorage.setItem("accounts", JSON.stringify(accounts));
    searchAndDisplayUsers(searchUserInput.value); // Refresh với tìm kiếm hiện tại
  }
}

function unlockUser(username) {
  const accounts = JSON.parse(localStorage.getItem("accounts"));
  const userIndex = accounts.findIndex(
    (acc) => acc.username === username && acc.role === "user"
  );

  if (userIndex !== -1) {
    accounts[userIndex].status = 1;
    localStorage.setItem("accounts", JSON.stringify(accounts));
    searchAndDisplayUsers(searchUserInput.value);
  }
}

function resetPassword(username) {
  const accounts = JSON.parse(localStorage.getItem("accounts"));
  const userIndex = accounts.findIndex(
    (acc) => acc.username === username && acc.role === "user"
  );

  if (userIndex !== -1) {
    accounts[userIndex].password = "12345";
    localStorage.setItem("accounts", JSON.stringify(accounts));
    alert(`✅ Đã đặt lại mật khẩu cho ${username}`);
    searchAndDisplayUsers(searchUserInput.value);
  }
}

// ============= QUẢN LÝ TỒN KHO =============

// Chuyển đổi tab
function showInventoryTab(tabName) {
  // Ẩn tất cả content
  document.querySelectorAll(".inventory-content").forEach((content) => {
    content.classList.remove("active");
  });

  // Bỏ active tất cả tab
  document.querySelectorAll(".inventory-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Hiển thị content và active tab tương ứng
  document.getElementById(`inventory-${tabName}`).classList.add("active");
  event.target.closest(".inventory-tab").classList.add("active");

  // Load dữ liệu cho từng tab
  if (tabName === "current") {
    showCurrentInventory();
  } else if (tabName === "alert") {
    showLowStockAlert();
  } else if (tabName === "report") {
    loadReportFilters();
    generateInventoryReport();
  }
}

// ============= TAB 1: TỒN KHO HIỆN TẠI =============
function showCurrentInventory() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const category = document.getElementById("filterCategory").value;
  const search = document.getElementById("searchProduct").value.toLowerCase();

  // Lọc sản phẩm
  let filteredProducts = products;

  if (category) {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  if (search) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.id.toString().includes(search)
    );
  }

  // Hiển thị bảng
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";

  let totalProducts = 0;
  let totalQuantity = 0;
  let totalValue = 0;

  filteredProducts.forEach((p) => {
    const qty = p.quantity || 0;
    const value = qty * (p.price || 0);

    let status = "";
    let statusClass = "";

    if (qty === 0) {
      status = "Hết hàng";
      statusClass = "status-out";
    } else if (qty <= 10) {
      status = "Sắp hết";
      statusClass = "status-low";
    } else {
      status = "Còn hàng";
      statusClass = "status-ok";
    }

    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.category || "Chưa phân loại"}</td>
        <td><strong>${qty}</strong></td>
        <td>${(p.price || 0).toLocaleString()}đ</td>
        <td>${value.toLocaleString()}đ</td>
        <td><span class="${statusClass}">${status}</span></td>
      </tr>
    `;

    totalProducts++;
    totalQuantity += qty;
    totalValue += value;
  });

  // Cập nhật thống kê
  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("totalQuantity").textContent =
    totalQuantity.toLocaleString();
  document.getElementById("totalValue").textContent =
    totalValue.toLocaleString() + "đ";
}

// Load categories cho filter
function loadInventoryFilters() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const categories = [
    ...new Set(products.map((p) => p.category || "Chưa phân loại")),
  ];

  const select = document.getElementById("filterCategory");
  select.innerHTML = '<option value="">Tất cả</option>';

  categories.forEach((cat) => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// ============= TAB 2: CẢNH BÁO SẮP HẾT =============
function showLowStockAlert() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const threshold =
    parseInt(document.getElementById("alertThreshold").value) || 10;

  // Lọc sản phẩm sắp hết
  const lowStockProducts = products.filter(
    (p) => (p.quantity || 0) <= threshold
  );

  const tbody = document.querySelector("#alertTable tbody");
  tbody.innerHTML = "";

  if (lowStockProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px;">
          <i class="fa-solid fa-circle-check" style="color: #4caf50; font-size: 48px;"></i>
          <p style="margin-top: 10px; color: #4caf50;">✅ Tất cả sản phẩm đều đủ hàng!</p>
        </td>
      </tr>
    `;
    return;
  }

  lowStockProducts.forEach((p) => {
    const qty = p.quantity || 0;
    let alertLevel = "";
    let alertClass = "";

    if (qty === 0) {
      alertLevel = "Khẩn cấp";
      alertClass = "alert-critical";
    } else if (qty <= threshold / 2) {
      alertLevel = "Cao";
      alertClass = "alert-high";
    } else {
      alertLevel = "Trung bình";
      alertClass = "alert-medium";
    }

    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.category || "Chưa phân loại"}</td>
        <td><strong style="color: #f44336;">${qty}</strong></td>
        <td><span class="${alertClass}">${alertLevel}</span></td>
      </tr>
    `;
  });
}

// ============= TAB 3: BÁO CÁO NHẬP-XUẤT-TỒN =============
function loadReportFilters() {
  const products = JSON.parse(localStorage.getItem("products")) || [];

  const select = document.getElementById("reportProduct");
  select.innerHTML = '<option value="">Tất cả</option>';

  products.forEach((p) => {
    select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });

  // Set ngày mặc định: 30 ngày trước đến hôm nay
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  document.getElementById("reportEndDate").value = today
    .toISOString()
    .split("T")[0];
  document.getElementById("reportStartDate").value = thirtyDaysAgo
    .toISOString()
    .split("T")[0];
}

function generateInventoryReport() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const imports = JSON.parse(localStorage.getItem("imports")) || [];
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const productId = document.getElementById("reportProduct").value;
  const startDate = document.getElementById("reportStartDate").value;
  const endDate = document.getElementById("reportEndDate").value;

  if (!startDate || !endDate) {
    alert("⚠️ Vui lòng chọn khoảng thời gian!");
    return;
  }

  // Lọc sản phẩm
  let reportProducts = productId
    ? products.filter((p) => p.id == productId)
    : products;

  const tbody = document.querySelector("#reportTable tbody");
  tbody.innerHTML = "";

  let totalOpening = 0;
  let totalImported = 0;
  let totalExported = 0;
  let totalClosing = 0;

  reportProducts.forEach((p) => {
    // Tính tồn đầu kỳ (giả sử = tồn hiện tại - nhập + xuất trong kỳ)
    let imported = 0;
    let exported = 0;

    // Tính nhập trong kỳ
    imports.forEach((imp) => {
      if (
        imp.date >= startDate &&
        imp.date <= endDate &&
        imp.status === "completed"
      ) {
        imp.items.forEach((item) => {
          if (item.productId == p.id) {
            imported += item.quantity;
          }
        });
      }
    });

    // Tính xuất trong kỳ
    orders.forEach((order) => {
      if (
        order.date >= startDate &&
        order.date <= endDate &&
        order.status === "delivered"
      ) {
        order.items.forEach((item) => {
          if (item.id == p.id) {
            exported += item.quantity;
          }
        });
      }
    });

    const closing = p.quantity || 0;
    const opening = closing - imported + exported;

    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${opening}</td>
        <td style="color: #4caf50;"><strong>+${imported}</strong></td>
        <td style="color: #f44336;"><strong>-${exported}</strong></td>
        <td><strong>${closing}</strong></td>
      </tr>
    `;

    totalOpening += opening;
    totalImported += imported;
    totalExported += exported;
    totalClosing += closing;
  });

  // Cập nhật thống kê
  document.getElementById("reportOpeningStock").textContent =
    totalOpening.toLocaleString();
  document.getElementById("reportImported").textContent =
    totalImported.toLocaleString();
  document.getElementById("reportExported").textContent =
    totalExported.toLocaleString();
  document.getElementById("reportClosingStock").textContent =
    totalClosing.toLocaleString();
}

// ============= KHỞI TẠO =============
function initInventory() {
  loadInventoryFilters();
  showCurrentInventory();
}
