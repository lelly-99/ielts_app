
export default function home_route() {

  async function home(req, res) {
    try {
      res.render('index', {
        title: 'IELTS Siulator',
        isHomePage: true
    });
    } catch (error) {
      console.error('Home Page Error:', error);
    }
  }

  return {
    home,
  };
}