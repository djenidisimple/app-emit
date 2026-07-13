using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEmit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomHeuresToSeance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "HeureDebutCustom",
                table: "SeancesCours",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "HeureFinCustom",
                table: "SeancesCours",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeureDebut",
                table: "Reservations",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NiveauId",
                table: "Reservations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParcoursId",
                table: "Reservations",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_NiveauId",
                table: "Reservations",
                column: "NiveauId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ParcoursId",
                table: "Reservations",
                column: "ParcoursId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Niveaux_NiveauId",
                table: "Reservations",
                column: "NiveauId",
                principalTable: "Niveaux",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Parcours_ParcoursId",
                table: "Reservations",
                column: "ParcoursId",
                principalTable: "Parcours",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Niveaux_NiveauId",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Parcours_ParcoursId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_NiveauId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_ParcoursId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "HeureDebutCustom",
                table: "SeancesCours");

            migrationBuilder.DropColumn(
                name: "HeureFinCustom",
                table: "SeancesCours");

            migrationBuilder.DropColumn(
                name: "HeureDebut",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "NiveauId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "ParcoursId",
                table: "Reservations");
        }
    }
}
