using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClubberApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Availability",
                table: "Matches",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("194dfef5-573b-4abc-a962-ca713c78bc50"),
                column: "Availability",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("3e30376f-e079-4b72-9768-417b98a470c7"),
                column: "Availability",
                value: 0);

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("755f9549-04d3-4fc9-a543-97eece49cf70"),
                column: "Availability",
                value: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Availability",
                table: "Matches");
        }
    }
}
