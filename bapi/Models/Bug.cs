using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace bapi.Models
{
    public class Bug
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Status { get; set; }  

        [Required]
        public string Priority { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public DateTime? ResolvedDate { get; set; }  // Nullable, as it will only be set when the bug is closed

        // Foreign key to the assigned user
        public int? AssignedUserId { get; set; }

        [ForeignKey("AssignedUserId")]
        public User? AssignedUser { get; set; }  // Navigation property to the User
    }
}
