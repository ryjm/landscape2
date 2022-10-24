import React, { useCallback, useState, FormEvent, useEffect } from 'react';
import api from '../state/api';
import {
  setAccessKeyId,
  setCurrentBucket,
  setEndpoint,
  setSecretAccessKey,
} from '@urbit/api';
import { useForm } from 'react-hook-form';
import cn from 'classnames';
import { useAsyncCall } from '../logic/useAsyncCall';
import { useStorageState } from '../state/storage';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';

interface CredentialsSubmit {
  endpoint: string;
  accessId: string;
  accessSecret: string;
  bucket: string;
}

export const StoragePrefs = () => {
  const { s3, loaded, ...storageState } = useStorageState();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, isValid, isSubmitSuccessful },
  } = useForm<CredentialsSubmit>({
    mode: 'onChange',
  });

  const { call: addS3Credentials, status } = useAsyncCall(
    useCallback(async (data: CredentialsSubmit) => {
      api.poke(setEndpoint(data.endpoint));
      api.poke(setAccessKeyId(data.accessId));
      api.poke(setSecretAccessKey(data.accessSecret));
      api.poke(setCurrentBucket(data.bucket));
    }, [])
  );

  useEffect(() => {
    useStorageState.getState().initialize(api);
  }, []);

  useEffect(() => {
    loaded && reset();
  }, [loaded, reset]);

  return (
    <div className="inner-section space-y-8">
      <h2 className="h4">Remote Storage</h2>
      <div className="mb-8 flex flex-col space-y-3 leading-5">
        <p>
          Configure your urbit to enable uploading your own images or other
          files in Urbit applications.
        </p>
        <p>
          Read more about setting up S3 storage in the{' '}
          <a
            className="font-bold"
            rel="external"
            target="_blank"
            href="https://operators.urbit.org/manual/os/s3"
          >
            Urbit Operator's Manual
          </a>
          .
        </p>
      </div>
      <form onSubmit={handleSubmit(addS3Credentials)}>
        <div className="mb-8 flex flex-col space-y-2">
          <label className="font-semibold" htmlFor="endpoint">
            Endpoint<span title="Required field">*</span>
          </label>
          <input
            disabled={!loaded}
            required
            id="endpoint"
            type="text"
            defaultValue={s3.credentials?.endpoint}
            {...register('endpoint', { required: true })}
            className="input default-ring bg-gray-50"
          />
        </div>
        <div className="mb-8 flex flex-col space-y-2">
          <label className="font-semibold" htmlFor="key">
            Access Key ID<span title="Required field">*</span>
          </label>
          <input
            disabled={!loaded}
            required
            id="key"
            type="text"
            defaultValue={s3.credentials?.accessKeyId}
            {...register('accessId', { required: true })}
            className="input default-ring bg-gray-50"
          />
        </div>
        <div className="mb-8 flex flex-col space-y-2">
          <label className="font-semibold" htmlFor="secretAccessKey">
            Secret Access Key<span title="Required field">*</span>
          </label>
          <input
            disabled={!loaded}
            required
            id="secretAccessKey"
            type="text"
            defaultValue={s3.credentials?.secretAccessKey}
            {...register('accessSecret', { required: true })}
            className="input default-ring bg-gray-50"
          />
        </div>
        <div className="mb-8 flex flex-col space-y-2">
          <label className="font-semibold" htmlFor="bucket">
            Bucket Name<span title="Required field">*</span>
          </label>
          <input
            disabled={!loaded}
            required
            id="bucket"
            type="text"
            defaultValue={s3.configuration.currentBucket}
            {...register('bucket', { required: true })}
            className="input default-ring bg-gray-50"
          />
        </div>
        <Button
          type="submit"
          disabled={!isDirty || !isValid}
          className={cn(
            !isDirty || !isValid || isSubmitSuccessful
              ? 'cursor-not-allowed bg-gray-200 text-gray-100'
              : ''
          )}
        >
          {isSubmitting ? <Spinner /> : 'Save'}
          {isSubmitSuccessful && ' Successful'}
        </Button>
      </form>
    </div>
  );
};
