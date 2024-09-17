using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using bapi.Models;  
using Microsoft.Extensions.Logging;  

namespace bapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BugsController : ControllerBase
    {
        private readonly BugTrackingContext _context;
        private readonly ILogger<BugsController> _logger;

        public BugsController(BugTrackingContext context, ILogger<BugsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/bugs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bug>>> GetBugs()
        {
            try
            {
                _logger.LogInformation("Fetching all bugs from the database.");
                var bugs = await _context.Bugs
                                        .Include(b => b.AssignedUser)  // Eager load the assigned user
                                        .ToListAsync();

                return Ok(bugs); 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching the bugs.");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/bugs/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBug(int id)
        {
            try
            {
                _logger.LogInformation("Fetching bug with ID {id}", id);
                var bug = await _context.Bugs
                                        .Include(b => b.AssignedUser)  // Eager load the assigned user
                                        .FirstOrDefaultAsync(b => b.Id == id);

                if (bug == null)
                {
                    _logger.LogWarning("Bug with ID {id} not found.", id);
                    return NotFound();  // Return 404 if the bug is not found
                }

                return Ok(bug);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching the bug with ID {id}.", id);
                return StatusCode(500, "Internal server error");
            }
        }

         // New: Get Bugs Created by Logged-in User
        [HttpGet("user-bugs/{userId}")]
        public IActionResult GetUserBugs(int userId)
        {
            // Fetch bugs where AssignedUserId matches the logged-in user's ID
            var userBugs = _context.Bugs
                                .Where(bug => bug.AssignedUserId == userId)  // Ensure this is filtering correctly
                                .ToList();

            if (!userBugs.Any())
            {
                Console.WriteLine($"No bugs found for user {userId}");
            }
            return Ok(userBugs);
        }

        // POST: api/bugs
        [HttpPost]
        public async Task<ActionResult<Bug>> PostBug(Bug bug)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for bug creation.");
                    return BadRequest(ModelState);  // Return 400 if the model is invalid
                }

                _context.Bugs.Add(bug);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Bug created with ID {id}.", bug.Id);
                return CreatedAtAction("GetBug", new { id = bug.Id }, bug);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating the bug.");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/bugs/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBug(int id, Bug bug)
        {
            try
            {
                if (id != bug.Id)
                {
                    _logger.LogWarning("Bug ID in the URL does not match the Bug ID in the body.");
                    return BadRequest();  // Return 400 if the IDs don't match
                }

                _context.Entry(bug).State = EntityState.Modified;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!BugExists(id))
                    {
                        _logger.LogWarning("Bug with ID {id} not found.", id);
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }

                _logger.LogInformation("Bug with ID {id} updated.", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating the bug with ID {id}.", id);
                return StatusCode(500, "Internal server error");
            }
        }


        // PUT: api/bugs/{id}/resolve
        [HttpPut("{id}/resolve")]
        public async Task<IActionResult> ResolveBug(int id)
        {
            try
            {
                _logger.LogInformation("Resolving bug with ID {id}.", id);
                var bug = await _context.Bugs.FindAsync(id);
                if (bug == null)
                {
                    _logger.LogWarning("Bug with ID {id} not found.", id);
                    return NotFound();  // Return 404 if the bug is not found
                }

                if (bug.Status == "Closed")
                {
                    _logger.LogWarning("Bug with ID {id} is already resolved.", id);
                    return BadRequest("Bug is already resolved.");  // Return 400 if the bug is already closed
                }

                bug.Status = "Closed";
                bug.ResolvedDate = DateTime.Now;  // Set the ResolvedDate

                _context.Entry(bug).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Bug with ID {id} resolved.", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while resolving the bug with ID {id}.", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/bugs/{id}/assign-user/{userId}
        [HttpPut("{id}/assign-user/{userId}")]
        public async Task<IActionResult> AssignUserToBug(int id, int userId)
        {
            try
            {
                _logger.LogInformation("Assigning user with ID {userId} to bug with ID {id}.", userId, id);
                var bug = await _context.Bugs.FindAsync(id);
                if (bug == null)
                {
                    _logger.LogWarning("Bug with ID {id} not found.", id);
                    return NotFound();  // Return 404 if the bug is not found
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {userId} not found.", userId);
                    return NotFound();  // Return 404 if the user is not found
                }

                bug.AssignedUserId = userId;

                _context.Entry(bug).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                _logger.LogInformation("User with ID {userId} assigned to bug with ID {id}.", userId, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while assigning user with ID {userId} to bug with ID {id}.", userId, id);
                return StatusCode(500, "Internal server error");
            }
        }

        private bool BugExists(int id)
        {
            return _context.Bugs.Any(e => e.Id == id);
        }
    }
}
