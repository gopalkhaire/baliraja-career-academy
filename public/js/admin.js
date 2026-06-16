/* Baliraja Career Academy - Admin JS */
document.addEventListener('DOMContentLoaded', () => {

  // Sidebar toggle for mobile
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Auto-hide alerts after 4 seconds
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }, 4000);
  });

  // Image preview before upload
  document.querySelectorAll('input[type="file"][accept*="image"]').forEach(input => {
    input.addEventListener('change', function() {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        let preview = this.parentElement.querySelector('.preview-img');
        if (!preview) {
          preview = document.createElement('img');
          preview.className = 'preview-img';
          this.parentElement.appendChild(preview);
        }
        preview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  // Confirm delete with nicer UI
  document.querySelectorAll('form[onsubmit*="confirm"]').forEach(form => {
    form.removeAttribute('onsubmit');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
        form.submit();
      }
    });
  });

  // Table search filter
  const searchInputs = document.querySelectorAll('.table-search');
  searchInputs.forEach(input => {
    input.addEventListener('input', function() {
      const val = this.value.toLowerCase();
      const tbody = document.querySelector('.admin-table tbody');
      if (!tbody) return;
      tbody.querySelectorAll('tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
      });
    });
  });
});
