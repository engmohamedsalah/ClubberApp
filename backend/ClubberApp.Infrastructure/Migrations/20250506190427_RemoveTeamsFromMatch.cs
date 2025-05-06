using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClubberApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTeamsFromMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Teams",
                table: "Matches");

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("194dfef5-573b-4abc-a962-ca713c78bc50"),
                column: "Status",
                value: 2);

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("3e30376f-e079-4b72-9768-417b98a470c7"),
                column: "Status",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("755f9549-04d3-4fc9-a543-97eece49cf70"),
                column: "Status",
                value: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Teams",
                table: "Matches",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("194dfef5-573b-4abc-a962-ca713c78bc50"),
                columns: new[] { "Status", "Teams" },
                values: new object[] { 1, "[]" });

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("3e30376f-e079-4b72-9768-417b98a470c7"),
                columns: new[] { "Status", "Teams" },
                values: new object[] { 0, "[]" });

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("755f9549-04d3-4fc9-a543-97eece49cf70"),
                columns: new[] { "Status", "Teams" },
                values: new object[] { 0, "[]" });
        }
    }
}
