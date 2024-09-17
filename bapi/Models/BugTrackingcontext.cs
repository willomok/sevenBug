using Microsoft.EntityFrameworkCore;
using bapi.Models;  

namespace bapi.Models
{
    public class BugTrackingContext : DbContext
    {
        public BugTrackingContext(DbContextOptions<BugTrackingContext> options)
            : base(options)
        {
        }

        public DbSet<Bug> Bugs { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseMySql("server=localhost;port=3306;database=fiveBug;user=root;password=Blaazer100!;",
                    new MySqlServerVersion(new Version(8, 0, 0)));
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuring the one-to-many relationship between User and Bug
            modelBuilder.Entity<Bug>()
                .HasOne(b => b.AssignedUser)
                .WithMany(u => u.AssignedBugs)
                .HasForeignKey(b => b.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull); 

            base.OnModelCreating(modelBuilder);
        }
    }
}
