function showToast(message, icon = "info") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      const container = toast.parentElement;
      if (container) {
        container.style.zIndex = "99999";
      }
    },
  });

  Toast.fire({
    icon: icon,
    title: message,
  });
}
