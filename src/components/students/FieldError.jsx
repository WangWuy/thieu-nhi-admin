const FieldError = ({ error }) => {
    if (!error) return null;
    return <p className="text-red-600 text-xs mt-1">{error}</p>;
};

export default FieldError;
