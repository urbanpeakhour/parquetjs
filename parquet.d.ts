type ParquetLogicalType =
  | "BOOLEAN"
  | "INT32"
  | "INT64"
  | "INT96"
  | "FLOAT"
  | "DOUBLE"
  | "BYTE_ARRAY"
  | "FIXED_LEN_BYTE_ARRAY"
  | "UTF8"
  | "ENUM"
  | "TIME_MILLIS"
  | "TIME_MICROS"
  | "DATE"
  | "TIMESTAMP_MILLIS"
  | "TIMESTAMP_MICROS"
  | "UINT_8"
  | "UINT_16"
  | "UINT_32"
  | "UINT_64"
  | "INT_8"
  | "INT_16"
  | "INT_32"
  | "INT_64"
  | "JSON"
  | "BSON"
  | "INTERVAL";
type ParquetConvertedType = "LIST" | "MAP";
type ParquetCodec = "PLAIN" | "RLE" | "PLAIN_DICTIONARY";
type ParquetCompressionMethod =
  | "UNCOMPRESSED"
  | "GZIP"
  | "SNAPPY"
  // | "LZO"
  | "BROTLI";

export type ParquetSchemaDefinition = Record<string, ParquetFieldDefinition>;

export interface ParquetFieldDefinition {
  type: ParquetLogicalType | ParquetConvertedType;
  optional?: boolean;
  repeated?: boolean;
  encoding?: ParquetCodec;
  compression?: ParquetCompressionMethod;
  typeLength?: number;
  statistics?: any;
  fields?: ParquetSchemaDefinition;
}

export class ParquetSchema {
  constructor(schema: ParquetSchemaDefinition);
  findField(path: string | string[]): ParquetFieldDefinition;
  findFieldBranch(path: string | string[]): ParquetFieldDefinition;
}

/**
 * Write a parquet file to an output stream. The ParquetWriter will perform
 * buffering/batching for performance, so close() must be called after all
 * rows are written.
 */
export class ParquetWriter {
  /**
   * Convenience method to create a new buffered parquet writer that writes to the
   * specified file.
   */
  static openFile(
    schema: ParquetSchema,
    path: string,
    options?: any
  ): Promise<ParquetWriter>;

  /**
   * Convenience method to create a new buffered parquet writer that writes to the
   * specified stream.
   */
  static openStream(
    schema: ParquetSchema,
    outputStream: import("fs").WriteStream,
    options?: any
  ): Promise<ParquetWriter>;

  /**
   * Append a single row to the parquet file. Rows are buffered in memory until
   * rowGroupSize rows are in the buffer or close() is called
   */
  appendRow(row: any): Promise<void>;

  /**
   * Finish writing the parquet file and commit the footer to disk. This method
   * MUST be called after you are finished adding rows. You must not call this
   * method twice on the same object or add any rows after the close() method has
   * been called.
   */
  close(callback?: () => any): Promise<void>;
}

/**
 * A parquet cursor is used to retrieve rows from a parquet file in order
 */
export class ParquetCursor<T = any> {
  /**
   * Retrieve the next row from the cursor. Returns a row or NULL if the end
   * of the file was reached
   */
  next(): Promise<T | null>;

  /**
   * Rewind the cursor the the beginning of the file
   */
  rewind(): void;
}

/**
 * A parquet reader allows retrieving the rows from a parquet file in order.
 * The basic usage is to create a reader and then retrieve a cursor/iterator
 * which allows you to consume row after row until all rows have been read. It is
 * important that you call close() after you are finished reading the file to
 * avoid leaking file descriptors.
 */
export class ParquetReader {
  /**
   * Open the parquet file pointed to by the specified path and return a new
   * parquet reader.
   */
  static openFile(
    filePath: import("fs").PathLike,
    options
  ): Promise<ParquetReader>;

  /**
   * Open the buffer as a parquet file and return a new parquet reader.
   */
  static openBuffer(buffer: Buffer, options?): Promise<ParquetReader>;

  /**
   * Open the parquet file from S3 using the supplied aws client and params
   * The params have to include `Bucket` and `Key` to the file requested.
   * This function returns a new parquet reader.
   */
  static openS3(client, params, options?): Promise<ParquetReader>;

  /**
   * Open the parquet file from a url using the supplied request module
   * params should either be a string (url) or an object that includes
   * a `url` property. This function returns a new parquet reader.
   */
  static openUrl(request, params, options?): Promise<ParquetReader>;

  /**
   * Return a cursor to the file. You may open more than one cursor and use
   * them concurrently. All cursors become invalid once close() is called on
   * the reader object.
   *
   * The required_columns parameter controls which columns are actually read
   * from disk. An empty array or no value implies all columns. A list of column
   * names means that only those columns should be loaded from disk.
   */
  getCursor(list?: any[]): ParquetCursor;

  /**
   * Close this parquet reader. You MUST call this method once you're finished
   * reading rows.
   */
  close(): Promise<void>;
}
