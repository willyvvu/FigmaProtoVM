# Variables


# Default target
all: 


# Phony target to clean up cloned repository (restore it back to original state)
clean-submodule:
	echo "Cleaning up cloned repository..."
# cd codegen && git clean -dfx && git reset --hard HEAD
    
.PHONY: all clone replace_file clean
