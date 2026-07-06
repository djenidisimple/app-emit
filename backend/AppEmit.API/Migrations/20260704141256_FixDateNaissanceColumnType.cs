using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEmit.API.Migrations
{
    /// <inheritdoc />
    public partial class FixDateNaissanceColumnType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Niveaux_NiveauId",
                table: "SeancesCours");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Creneaux");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateNaissance",
                table: "Utilisateurs",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Niveaux_NiveauId",
                table: "SeancesCours",
                column: "NiveauId",
                principalTable: "Niveaux",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Niveaux_NiveauId",
                table: "SeancesCours");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateNaissance",
                table: "Utilisateurs",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "Creneaux",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Niveaux_NiveauId",
                table: "SeancesCours",
                column: "NiveauId",
                principalTable: "Niveaux",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
