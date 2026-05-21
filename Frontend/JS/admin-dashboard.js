document.addEventListener("DOMContentLoaded", () => {
  initAdminShell();

  const totalCourses = document.getElementById("totalCourses");
  const totalStudents = document.getElementById("totalStudents");
  const totalQuizzes = document.getElementById("totalQuizzes");
  const pendingApprovals = document.getElementById("pendingApprovals");

  const tokens = typeof getAuthTokens === "function" ? getAuthTokens() : null;
  if (!tokens || !tokens.access) return;

  fetch(`${API_BASE_URL}/admin/dashboard-stats/`, {
    headers: { Authorization: `Bearer ${tokens.access}` }
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data) return;
      if (totalCourses) totalCourses.textContent = data.total_courses ?? 0;
      if (totalStudents) totalStudents.textContent = data.total_students ?? 0;
      if (totalQuizzes) totalQuizzes.textContent = data.total_quizzes ?? 0;
      if (pendingApprovals) pendingApprovals.textContent = data.pending_admins ?? 0;
    })
    .catch(() => { });
});