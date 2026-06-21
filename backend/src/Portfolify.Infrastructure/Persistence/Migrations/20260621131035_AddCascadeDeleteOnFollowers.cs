using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolify.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCascadeDeleteOnFollowers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Followers_DeveloperProfiles_FollowedId",
                table: "Followers");

            migrationBuilder.DropForeignKey(
                name: "FK_Followers_DeveloperProfiles_FollowerId",
                table: "Followers");

            migrationBuilder.DropForeignKey(
                name: "FK_SkillEndorsements_DeveloperProfiles_EndorsedById",
                table: "SkillEndorsements");

            migrationBuilder.AddForeignKey(
                name: "FK_Followers_DeveloperProfiles_FollowedId",
                table: "Followers",
                column: "FollowedId",
                principalTable: "DeveloperProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Followers_DeveloperProfiles_FollowerId",
                table: "Followers",
                column: "FollowerId",
                principalTable: "DeveloperProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SkillEndorsements_DeveloperProfiles_EndorsedById",
                table: "SkillEndorsements",
                column: "EndorsedById",
                principalTable: "DeveloperProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Followers_DeveloperProfiles_FollowedId",
                table: "Followers");

            migrationBuilder.DropForeignKey(
                name: "FK_Followers_DeveloperProfiles_FollowerId",
                table: "Followers");

            migrationBuilder.DropForeignKey(
                name: "FK_SkillEndorsements_DeveloperProfiles_EndorsedById",
                table: "SkillEndorsements");

            migrationBuilder.AddForeignKey(
                name: "FK_Followers_DeveloperProfiles_FollowedId",
                table: "Followers",
                column: "FollowedId",
                principalTable: "DeveloperProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Followers_DeveloperProfiles_FollowerId",
                table: "Followers",
                column: "FollowerId",
                principalTable: "DeveloperProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SkillEndorsements_DeveloperProfiles_EndorsedById",
                table: "SkillEndorsements",
                column: "EndorsedById",
                principalTable: "DeveloperProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
