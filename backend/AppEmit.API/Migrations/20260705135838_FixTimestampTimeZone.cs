using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEmit.API.Migrations
{
    /// <inheritdoc />
    public partial class FixTimestampTimeZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Salles_SalleId",
                table: "SeancesCours");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateFinAnnee",
                table: "SeancesCours",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateDebutAnnee",
                table: "SeancesCours",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateFin",
                table: "ExceptionsPlanning",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateDebut",
                table: "ExceptionsPlanning",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.CreateIndex(
                name: "IX_ExceptionsPlanning_NouvelleSalleId",
                table: "ExceptionsPlanning",
                column: "NouvelleSalleId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExceptionsPlanning_Salles_NouvelleSalleId",
                table: "ExceptionsPlanning",
                column: "NouvelleSalleId",
                principalTable: "Salles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Salles_SalleId",
                table: "SeancesCours",
                column: "SalleId",
                principalTable: "Salles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExceptionsPlanning_Salles_NouvelleSalleId",
                table: "ExceptionsPlanning");

            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Salles_SalleId",
                table: "SeancesCours");

            migrationBuilder.DropIndex(
                name: "IX_ExceptionsPlanning_NouvelleSalleId",
                table: "ExceptionsPlanning");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateFinAnnee",
                table: "SeancesCours",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateDebutAnnee",
                table: "SeancesCours",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateFin",
                table: "ExceptionsPlanning",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateDebut",
                table: "ExceptionsPlanning",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Salles_SalleId",
                table: "SeancesCours",
                column: "SalleId",
                principalTable: "Salles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
