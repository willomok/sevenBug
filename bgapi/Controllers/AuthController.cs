using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using bapi.Models;

namespace bapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly BugTrackingContext _context;

        public AuthController(BugTrackingContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            // Check if loginRequest is null or missing required fields
            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest("Email and password are required.");
            }

            // Fetch user from the database based on email and password
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.Password == loginRequest.Password);

            // If user not found, return Unauthorized (401)
            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }
            return Ok(user);
        }
    }

    // LoginRequest class to handle incoming login data
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
