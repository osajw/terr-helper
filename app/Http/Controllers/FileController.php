<?php

namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
 
class FileController extends Controller
{
  /** Upload file */
  public function upload(Request $request)
  {
    $data = $request->all();
    $validator = Validator::make($data, [
      'file' => 'required|file|mimes:jpg,jpeg,png,bmp,gif',
      'name' => 'required|string'
    ]);

    if ($validator->fails())
    {
      return response()->json($validator->errors()->toJson() , 401);
    }

    $request->file('file')->move(public_path('images'), $request->name);

    return response()->json(['success'=>'You have successfully upload file.']);
  }
}
