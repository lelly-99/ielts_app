export default function dashboard_route() {

    async function dashboard(req, res) {
      try {
        res.render('dashboard', {
            title: 'Dashboard',
            currentPage: 'dashboard',
        });
      } catch (error) {
        console.error('Dashboard Page Error:', error);
      }
    }
  
    return {
      dashboard,
    };
  }