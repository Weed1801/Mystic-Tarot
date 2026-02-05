using Microsoft.EntityFrameworkCore;
using TarotApi.Models;

namespace TarotApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TarotCard> TarotCards { get; set; }
    public DbSet<ReadingSession> ReadingSessions { get; set; }
    public DbSet<ReadingCard> ReadingCards { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships if needed, though conventions handle most
        modelBuilder.Entity<ReadingCard>()
            .HasOne(rc => rc.Session)
            .WithMany(s => s.ReadingCards)
            .HasForeignKey(rc => rc.SessionId);

        modelBuilder.Entity<ReadingCard>()
            .HasOne(rc => rc.Card)
            .WithMany()
            .HasForeignKey(rc => rc.CardId);
    }
}
