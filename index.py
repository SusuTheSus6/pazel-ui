from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

BASE_DIR = os.getcwd()  # Base directory for file and folder operations
TARGET_RESULTS_FOLDER = os.path.join(BASE_DIR, 'results')
ROOT_DIRECTORY = "pazel-front\\public"
# Utility function
def safe_path(path):
    """Ensure operations are performed within the base directory."""
    full_path = os.path.abspath(os.path.join(BASE_DIR, path))
    if not full_path.startswith(BASE_DIR):
        raise ValueError("Path is outside the base directory")
    return full_path

@app.route('/all-steps', methods=['GET'])
def get_all_files():
    folder_path = request.args.get('path', '')
    run_id = request.args.get('run_id', '')

    if not run_id:
        return jsonify({'error': "Missing run_id"}), 500

    try:
        final_folder_path = os.path.join(ROOT_DIRECTORY + '/assets/' + run_id, folder_path)
        path = safe_path(final_folder_path)
        if not os.path.exists(path):
            return jsonify({'error': 'Path does not exist'}), 404
        if not os.path.isdir(path):
            return jsonify({'error': 'Not a directory'}), 400

        res = []
        for root, _, steps in os.walk(path):
            # ref = _
            data = []
            if path == root:
                continue;
            for step in steps:
                if ".DS_Store" in step:
                    continue
                file_path = os.path.relpath(os.path.join(root, step), BASE_DIR)
                data.append({
                    "src": file_path.replace(ROOT_DIRECTORY,"").replace("\\", "/")
                })
            res.append({
                'ref': root,
                'key': root,
                'data': data
            })

        return jsonify({'files': res})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def createFileForDebug(runId, data_to_write):
    try:
        os.makedirs(TARGET_RESULTS_FOLDER + "/" + runId, exist_ok=True)

        # Combine folder path and file name
        file_path = os.path.join(TARGET_RESULTS_FOLDER + "/" + runId, 'debug.txt')

        with open(file_path, "w") as file:
            json.dump(data_to_write, file, indent=4)

    except Exception as e:
        print("Error saving debug")
        raise jsonify({'error': str(e)})(500)



@app.route('/batch-submit', methods=['POST'])
def batch_create():
    try:
        # Parse the incoming JSON array
        body = request.json
        steps = body.get('steps', [])
        run_id = body.get('run_id', '')

        if not isinstance(steps, list):
            return jsonify({'error': 'Input must be a list of operations'}), 400

        if not run_id:
            return jsonify({'error': 'Bad run id'}), 400
        results = []

        try:
            createFileForDebug(run_id, steps)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

        # for singleStep in steps:
        #     # Validate input structure for each operation
        #     path = singleStep.get('src')
        #     selectedStep = singleStep.get('selectedStep', False)
        #     fullSrc = singleStep.get('fullSrc', False)

        return jsonify({'ok': True, 'error': None})
    except Exception as e:
        return jsonify({'ok': False,'error': str(e)}), 500

@app.route('/create', methods=['POST'])
def create():
    data = request.json
    path = data.get('path')
    is_folder = data.get('isFolder', False)
    is_binary = data.get('isBinary', False)  # New field for binary files

    try:
        full_path = safe_path(path)
        if is_folder:
            os.makedirs(full_path, exist_ok=True)
        else:
            if is_binary:
                # Decode the binary content from base64 and write to file
                import base64
                binary_content = base64.b64decode(data.get('content', ''))
                with open(full_path, 'wb') as f:
                    f.write(binary_content)
            else:
                # Write plain text content
                with open(full_path, 'w') as f:
                    f.write(data.get('content', ''))
        return jsonify({'message': 'Created successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete', methods=['DELETE'])
def delete():
    data = request.json
    path = data.get('path')

    try:
        full_path = safe_path(path)
        if os.path.isdir(full_path):
            os.rmdir(full_path)
        elif os.path.isfile(full_path):
            os.remove(full_path)
        else:
            return jsonify({'error': 'Path does not exist'}), 404
        return jsonify({'message': 'Deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rename', methods=['PUT'])
def rename():
    data = request.json
    old_path = data.get('oldPath')
    new_path = data.get('newPath')

    try:
        old_full_path = safe_path(old_path)
        new_full_path = safe_path(new_path)
        os.rename(old_full_path, new_full_path)
        return jsonify({'message': 'Renamed successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5004)
