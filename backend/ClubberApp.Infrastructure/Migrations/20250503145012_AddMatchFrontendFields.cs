using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClubberApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchFrontendFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Matches",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Teams",
                table: "Matches",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "Thumbnail",
                table: "Matches",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("194dfef5-573b-4abc-a962-ca713c78bc50"),
                columns: new[] { "Location", "Teams", "Thumbnail" },
                values: new object[] { "", "[]", "" });

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("3e30376f-e079-4b72-9768-417b98a470c7"),
                columns: new[] { "Location", "Teams", "Thumbnail" },
                values: new object[] { "", "[]", "" });

            migrationBuilder.UpdateData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: new Guid("755f9549-04d3-4fc9-a543-97eece49cf70"),
                columns: new[] { "Location", "Teams", "Thumbnail" },
                values: new object[] { "", "[]", "" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "Teams",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "Thumbnail",
                table: "Matches");
        }
    }
}
