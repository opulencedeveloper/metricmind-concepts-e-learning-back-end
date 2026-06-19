import mongoose from "mongoose";

class CommonValidator {
  public objectId = (value: string, helpers: any) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message("Invalid ID format.");
    }
    return value;
  };
}

export const commonValidator = new CommonValidator();
