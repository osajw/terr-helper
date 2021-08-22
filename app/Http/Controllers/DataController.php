<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Territory;
use App\Models\People;
use App\Models\Withdrawal;
use App\Models\Npv;

class DataController extends Controller
{
    protected $models = [
        'territory' => Territory::class,
        'people' => People::class,
        'withdrawal' => Withdrawal::class,
        'npv' => Npv::class,
    ];

    protected $validations = [
        'territory' => [
            'name' => 'required|string|min:1',
            'desc' => 'nullable|string|min:1',
            'difficulty' => 'nullable|numeric',
        ],
        'people' => [
            'firstname' => 'required|string|min:1',
            'lastname' => 'required|string|min:1',
            'email' => 'nullable|string|min:5',
            'phone' => 'nullable|string|min:1',
        ],
        'withdrawal' => [
            'territoryId' => 'required|exists:territories,id',
            'peopleId' => 'required|exists:peoples,id',
            'outAt' => 'nullable|date',
            'inAt' => 'nullable|date',
        ],
        'npv' => [
            'territoryId' => 'required|exists:territories,id',
            'address' => 'nullable|string|min:1',
            'date' => 'nullable|date',
            'planUrl' => 'nullable|string|min:1',
        ],
    ];

    protected function getModel($type)
    {
        if (array_key_exists($type, $this->models)) {
            return $this->models[$type];
        }
        return null;
    }

    /** Display a listing of the resource. */
    public function index(Request $request, $type)
    {
        $model = $this->getModel($type);
        if (!$model) {
            return response()->json(['error' => 'invalid_type'], 400);
        }
        return response()->json($model::all());
    }

    /** Store a newly created resource in storage. */
    public function store(Request $request, $type)
    {
        $model = $this->models[$type];
        if (!$model) {
            return response()->json(['error' => 'invalid_type'], 400);
        }
        $validations = $this->validations[$type];
        $data = $request->only(array_keys($validations));
        $validator = Validator::make($data, $validations);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson() , 400);
        }

        $newModel = $model::create($data);
        return response()->json($newModel);
    }

    /** Display the specified resource. */
    public function show(Request $request, $type, $id)
    {
        $model = $this->models[$type];
        if (!$model) {
            return response()->json(['error' => 'invalid_type'], 400);
        }
        return $model::find($id);
    }

    /** Update the specified resource in storage. */
    public function update(Request $request, $type, $id)
    {
        $model = $this->models[$type];
        if (!$model) {
            return response()->json(['error' => 'invalid_type'], 400);
        }
        $validations = $this->validations[$type];
        foreach ($validations as $key => $value) {
            $validations[$key] = str_replace('required|', '', $value); // rm required
        }
        $data = $request->only(array_keys($validations));
        $validator = Validator::make($data, $validations);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson() , 400);
        }

        $el = $model::find($id);
        $el->update($data);

        return response()->json($el);
    }

    /** Remove the specified resource from storage. */
    public function destroy(Request $request, $type, $id)
    {
        $model = $this->models[$type];
        if (!$model) {
            return response()->json(['error' => 'invalid_type'], 400);
        }
        $model::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
