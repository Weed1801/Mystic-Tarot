using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TarotApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAnalysisColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FinalAdvice",
                table: "ReadingSessions",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FutureAnalysis",
                table: "ReadingSessions",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PastAnalysis",
                table: "ReadingSessions",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PresentAnalysis",
                table: "ReadingSessions",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinalAdvice",
                table: "ReadingSessions");

            migrationBuilder.DropColumn(
                name: "FutureAnalysis",
                table: "ReadingSessions");

            migrationBuilder.DropColumn(
                name: "PastAnalysis",
                table: "ReadingSessions");

            migrationBuilder.DropColumn(
                name: "PresentAnalysis",
                table: "ReadingSessions");
        }
    }
}
