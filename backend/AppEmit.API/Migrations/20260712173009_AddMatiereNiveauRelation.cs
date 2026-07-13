using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEmit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMatiereNiveauRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Add column as nullable (no FK yet)
            migrationBuilder.AddColumn<int>(
                name: "NiveauId",
                table: "Matieres",
                type: "integer",
                nullable: true);

            // Step 2: Assign existing matieres to the first available niveau (if any)
            // The WHERE clause ensures no change if no niveau exists
            migrationBuilder.Sql(@"
                UPDATE ""Matieres""
                SET ""NiveauId"" = (SELECT ""Id"" FROM ""Niveaux"" ORDER BY ""Id"" LIMIT 1)
                WHERE ""NiveauId"" IS NULL
                  AND EXISTS (SELECT 1 FROM ""Niveaux"");
            ");

            // Step 3: Make non-nullable (no FK yet, so default 0 is safe for any remaining nulls)
            migrationBuilder.AlterColumn<int>(
                name: "NiveauId",
                table: "Matieres",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Step 4: Fix rows with NiveauId=0 (from default) to use the first real niveau
            // If no niveau exists, rows stay at 0 and FK step below will fail — seed needed.
            migrationBuilder.Sql(@"
                UPDATE ""Matieres""
                SET ""NiveauId"" = (SELECT ""Id"" FROM ""Niveaux"" ORDER BY ""Id"" LIMIT 1)
                WHERE ""NiveauId"" = 0
                  AND EXISTS (SELECT 1 FROM ""Niveaux"");
            ");

            // Step 5: Create index
            migrationBuilder.CreateIndex(
                name: "IX_Matieres_NiveauId",
                table: "Matieres",
                column: "NiveauId");

            // Step 6: Add FK constraint
            // If any row still has NiveauId=0 (no niveau in DB), this will fail with FK violation
            migrationBuilder.AddForeignKey(
                name: "FK_Matieres_Niveaux_NiveauId",
                table: "Matieres",
                column: "NiveauId",
                principalTable: "Niveaux",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matieres_Niveaux_NiveauId",
                table: "Matieres");

            migrationBuilder.DropIndex(
                name: "IX_Matieres_NiveauId",
                table: "Matieres");

            migrationBuilder.DropColumn(
                name: "NiveauId",
                table: "Matieres");
        }
    }
}
