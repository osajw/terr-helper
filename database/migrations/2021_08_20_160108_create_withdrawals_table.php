<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWithdrawalsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('territoryId')
                ->constrained('territories')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreignUuid('peopleId')
                ->constrained('peoples');
            $table->date('outAt')->nullable();
            $table->date('inAt')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('withdrawals', function(Blueprint $table) {
			$table->dropForeign(['territoryId']);
			$table->dropForeign(['peopleId']);
		});

        Schema::dropIfExists('withdrawals');
    }
}
