--
-- PostgreSQL database dump
--

-- Dumped from database version 14.8 (Ubuntu 14.8-0ubuntu0.22.10.1)
-- Dumped by pg_dump version 14.8 (Ubuntu 14.8-0ubuntu0.22.10.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: assign_unleash_permission_to_role(text, text); Type: FUNCTION; Schema: public; Owner: unleash_user
--

CREATE FUNCTION public.assign_unleash_permission_to_role(permission_name text, role_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    var_role_id int;
    var_permission text;
BEGIN
    var_role_id := (SELECT r.id FROM roles r WHERE r.name = role_name);
    var_permission := (SELECT p.permission FROM permissions p WHERE p.permission = permission_name);

    IF NOT EXISTS (
        SELECT 1
        FROM role_permission AS rp
        WHERE rp.role_id = var_role_id AND rp.permission = var_permission
    ) THEN
        INSERT INTO role_permission(role_id, permission) VALUES (var_role_id, var_permission);
    END IF;
END
$$;


ALTER FUNCTION public.assign_unleash_permission_to_role(permission_name text, role_name text) OWNER TO unleash_user;

--
-- Name: assign_unleash_permission_to_role_for_all_environments(text, text); Type: FUNCTION; Schema: public; Owner: unleash_user
--

CREATE FUNCTION public.assign_unleash_permission_to_role_for_all_environments(permission_name text, role_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    var_role_id int;
    var_permission text;
BEGIN
    var_role_id := (SELECT id FROM roles r WHERE r.name = role_name);
    var_permission := (SELECT p.permission FROM permissions p WHERE p.permission = permission_name);

    INSERT INTO role_permission (role_id, permission, environment)
        SELECT var_role_id, var_permission, e.name
        FROM environments e
        WHERE NOT EXISTS (
            SELECT 1
            FROM role_permission rp
            WHERE rp.role_id = var_role_id
            AND rp.permission = var_permission
            AND rp.environment = e.name
        );
END;
$$;


ALTER FUNCTION public.assign_unleash_permission_to_role_for_all_environments(permission_name text, role_name text) OWNER TO unleash_user;

--
-- Name: date_floor_round(timestamp with time zone, interval); Type: FUNCTION; Schema: public; Owner: unleash_user
--

CREATE FUNCTION public.date_floor_round(base_date timestamp with time zone, round_interval interval) RETURNS timestamp with time zone
    LANGUAGE sql STABLE
    AS $_$
SELECT to_timestamp(
    (EXTRACT(epoch FROM $1)::integer / EXTRACT(epoch FROM $2)::integer)
    * EXTRACT(epoch FROM $2)::integer
)
$_$;


ALTER FUNCTION public.date_floor_round(base_date timestamp with time zone, round_interval interval) OWNER TO unleash_user;

--
-- Name: unleash_update_stat_environment_changes_counter(); Type: FUNCTION; Schema: public; Owner: unleash_user
--

CREATE FUNCTION public.unleash_update_stat_environment_changes_counter() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
            IF NEW.environment IS NOT NULL THEN
                INSERT INTO stat_environment_updates(day, environment, updates) SELECT DATE_TRUNC('Day', NEW.created_at), NEW.environment, 1 ON CONFLICT (day, environment) DO UPDATE SET updates = stat_environment_updates.updates + 1;
            END IF;

            return null;
        END;
    $$;


ALTER FUNCTION public.unleash_update_stat_environment_changes_counter() OWNER TO unleash_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action_set_events; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.action_set_events (
    id integer NOT NULL,
    action_set_id integer NOT NULL,
    signal_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    state text NOT NULL,
    signal jsonb NOT NULL,
    action_set jsonb NOT NULL
);


ALTER TABLE public.action_set_events OWNER TO unleash_user;

--
-- Name: action_set_events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.action_set_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.action_set_events_id_seq OWNER TO unleash_user;

--
-- Name: action_set_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.action_set_events_id_seq OWNED BY public.action_set_events.id;


--
-- Name: action_sets; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.action_sets (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer,
    name character varying(255),
    project character varying(255) NOT NULL,
    actor_id integer,
    source character varying(255),
    source_id integer,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true,
    description text
);


ALTER TABLE public.action_sets OWNER TO unleash_user;

--
-- Name: action_sets_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.action_sets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.action_sets_id_seq OWNER TO unleash_user;

--
-- Name: action_sets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.action_sets_id_seq OWNED BY public.action_sets.id;


--
-- Name: actions; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.actions (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer,
    action_set_id integer,
    sort_order integer,
    action character varying(255) NOT NULL,
    execution_params jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.actions OWNER TO unleash_user;

--
-- Name: actions_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.actions_id_seq OWNER TO unleash_user;

--
-- Name: actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.actions_id_seq OWNED BY public.actions.id;


--
-- Name: addons; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.addons (
    id integer NOT NULL,
    provider text NOT NULL,
    description text,
    enabled boolean DEFAULT true,
    parameters json,
    events json,
    created_at timestamp with time zone DEFAULT now(),
    projects jsonb DEFAULT '[]'::jsonb,
    environments jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.addons OWNER TO unleash_user;

--
-- Name: addons_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.addons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.addons_id_seq OWNER TO unleash_user;

--
-- Name: addons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.addons_id_seq OWNED BY public.addons.id;


--
-- Name: ai_chats; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.ai_chats (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    messages jsonb NOT NULL
);


ALTER TABLE public.ai_chats OWNER TO unleash_user;

--
-- Name: ai_chats_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.ai_chats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ai_chats_id_seq OWNER TO unleash_user;

--
-- Name: ai_chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.ai_chats_id_seq OWNED BY public.ai_chats.id;


--
-- Name: api_token_project; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.api_token_project (
    secret text NOT NULL,
    project text NOT NULL
);


ALTER TABLE public.api_token_project OWNER TO unleash_user;

--
-- Name: api_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.api_tokens (
    secret text NOT NULL,
    username text NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    seen_at timestamp with time zone,
    environment character varying,
    alias text,
    token_name text,
    created_by_user_id integer
);


ALTER TABLE public.api_tokens OWNER TO unleash_user;

--
-- Name: banners; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.banners (
    id integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    message text NOT NULL,
    variant text,
    sticky boolean DEFAULT false,
    icon text,
    link text,
    link_text text,
    dialog_title text,
    dialog text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.banners OWNER TO unleash_user;

--
-- Name: change_request_approvals; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_approvals (
    id integer NOT NULL,
    change_request_id integer NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.change_request_approvals OWNER TO unleash_user;

--
-- Name: change_request_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_request_approvals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_request_approvals_id_seq OWNER TO unleash_user;

--
-- Name: change_request_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_request_approvals_id_seq OWNED BY public.change_request_approvals.id;


--
-- Name: change_request_comments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_comments (
    id integer NOT NULL,
    change_request integer NOT NULL,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer NOT NULL
);


ALTER TABLE public.change_request_comments OWNER TO unleash_user;

--
-- Name: change_request_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_request_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_request_comments_id_seq OWNER TO unleash_user;

--
-- Name: change_request_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_request_comments_id_seq OWNED BY public.change_request_comments.id;


--
-- Name: change_request_events; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_events (
    id integer NOT NULL,
    feature character varying(255),
    action character varying(255) NOT NULL,
    payload jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    change_request_id integer NOT NULL
);


ALTER TABLE public.change_request_events OWNER TO unleash_user;

--
-- Name: change_request_events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_request_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_request_events_id_seq OWNER TO unleash_user;

--
-- Name: change_request_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_request_events_id_seq OWNED BY public.change_request_events.id;


--
-- Name: change_request_rejections; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_rejections (
    id integer NOT NULL,
    change_request_id integer NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.change_request_rejections OWNER TO unleash_user;

--
-- Name: change_request_rejections_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_request_rejections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_request_rejections_id_seq OWNER TO unleash_user;

--
-- Name: change_request_rejections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_request_rejections_id_seq OWNED BY public.change_request_rejections.id;


--
-- Name: change_request_schedule; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_schedule (
    change_request integer NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    created_by integer,
    status text,
    failure_reason text,
    reason text
);


ALTER TABLE public.change_request_schedule OWNER TO unleash_user;

--
-- Name: change_request_settings; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_settings (
    project character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    required_approvals integer DEFAULT 1
);


ALTER TABLE public.change_request_settings OWNER TO unleash_user;

--
-- Name: change_requests; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_requests (
    id integer NOT NULL,
    environment character varying(100),
    state character varying(255) NOT NULL,
    project character varying(255),
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    min_approvals integer DEFAULT 1,
    title text
);


ALTER TABLE public.change_requests OWNER TO unleash_user;

--
-- Name: change_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_requests_id_seq OWNER TO unleash_user;

--
-- Name: change_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_requests_id_seq OWNED BY public.change_requests.id;


--
-- Name: client_applications; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_applications (
    app_name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    seen_at timestamp with time zone,
    strategies json,
    description character varying(255),
    icon character varying(255),
    url character varying(255),
    color character varying(255),
    announced boolean DEFAULT false,
    created_by text
);


ALTER TABLE public.client_applications OWNER TO unleash_user;

--
-- Name: client_applications_usage; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_applications_usage (
    app_name character varying(255) NOT NULL,
    project character varying(255) NOT NULL,
    environment character varying(100) NOT NULL
);


ALTER TABLE public.client_applications_usage OWNER TO unleash_user;

--
-- Name: client_instances; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_instances (
    app_name character varying(255) NOT NULL,
    instance_id character varying(255) NOT NULL,
    client_ip character varying(255),
    last_seen timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    sdk_version character varying(255),
    environment character varying(255) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.client_instances OWNER TO unleash_user;

--
-- Name: client_metrics_env; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics_env (
    feature_name character varying(255) NOT NULL,
    app_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    yes bigint DEFAULT 0,
    no bigint DEFAULT 0
);


ALTER TABLE public.client_metrics_env OWNER TO unleash_user;

--
-- Name: client_metrics_env_daily; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics_env_daily (
    feature_name character varying(255) NOT NULL,
    app_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    date date NOT NULL,
    yes bigint DEFAULT 0,
    no bigint DEFAULT 0
);


ALTER TABLE public.client_metrics_env_daily OWNER TO unleash_user;

--
-- Name: client_metrics_env_variants; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics_env_variants (
    feature_name character varying(255) NOT NULL,
    app_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    variant text NOT NULL,
    count integer DEFAULT 0
);


ALTER TABLE public.client_metrics_env_variants OWNER TO unleash_user;

--
-- Name: client_metrics_env_variants_daily; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics_env_variants_daily (
    feature_name character varying(255) NOT NULL,
    app_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    date date NOT NULL,
    variant text NOT NULL,
    count bigint DEFAULT 0
);


ALTER TABLE public.client_metrics_env_variants_daily OWNER TO unleash_user;

--
-- Name: context_fields; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.context_fields (
    name character varying(255) NOT NULL,
    description text,
    sort_order integer DEFAULT 10,
    legal_values json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stickiness boolean DEFAULT false
);


ALTER TABLE public.context_fields OWNER TO unleash_user;

--
-- Name: dependent_features; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.dependent_features (
    parent character varying(255) NOT NULL,
    child character varying(255) NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    variants jsonb DEFAULT '[]'::jsonb NOT NULL
);


ALTER TABLE public.dependent_features OWNER TO unleash_user;

--
-- Name: environment_type_trends; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.environment_type_trends (
    id character varying(255) NOT NULL,
    environment_type character varying(255) NOT NULL,
    total_updates integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.environment_type_trends OWNER TO unleash_user;

--
-- Name: environments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.environments (
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    sort_order integer DEFAULT 9999,
    type text NOT NULL,
    enabled boolean DEFAULT true,
    protected boolean DEFAULT false
);


ALTER TABLE public.environments OWNER TO unleash_user;

--
-- Name: events; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.events (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    type character varying(255) NOT NULL,
    created_by character varying(255) NOT NULL,
    data json,
    tags json DEFAULT '[]'::json,
    project text,
    environment text,
    feature_name text,
    pre_data jsonb,
    announced boolean DEFAULT false NOT NULL,
    created_by_user_id integer,
    ip text
);


ALTER TABLE public.events OWNER TO unleash_user;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO unleash_user;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: favorite_features; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.favorite_features (
    feature character varying(255) NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.favorite_features OWNER TO unleash_user;

--
-- Name: favorite_projects; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.favorite_projects (
    project character varying(255) NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.favorite_projects OWNER TO unleash_user;

--
-- Name: feature_environments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_environments (
    environment character varying(100) DEFAULT 'default'::character varying NOT NULL,
    feature_name character varying(255) NOT NULL,
    enabled boolean NOT NULL,
    variants jsonb DEFAULT '[]'::jsonb NOT NULL,
    last_seen_at timestamp with time zone
);


ALTER TABLE public.feature_environments OWNER TO unleash_user;

--
-- Name: feature_lifecycles; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_lifecycles (
    feature character varying(255) NOT NULL,
    stage character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    status text,
    status_value text
);


ALTER TABLE public.feature_lifecycles OWNER TO unleash_user;

--
-- Name: feature_strategies; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_strategies (
    id text NOT NULL,
    feature_name character varying(255) NOT NULL,
    project_name character varying(255) NOT NULL,
    environment character varying(100) DEFAULT 'default'::character varying NOT NULL,
    strategy_name character varying(255) NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb NOT NULL,
    constraints jsonb,
    sort_order integer DEFAULT 9999 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    title text,
    disabled boolean DEFAULT false,
    variants jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_by_user_id integer
);


ALTER TABLE public.feature_strategies OWNER TO unleash_user;

--
-- Name: feature_strategy_segment; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_strategy_segment (
    feature_strategy_id text NOT NULL,
    segment_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.feature_strategy_segment OWNER TO unleash_user;

--
-- Name: feature_tag; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_tag (
    feature_name character varying(255) NOT NULL,
    tag_type text NOT NULL,
    tag_value text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by_user_id integer
);


ALTER TABLE public.feature_tag OWNER TO unleash_user;

--
-- Name: feature_types; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_types (
    id character varying(255) NOT NULL,
    name character varying NOT NULL,
    description character varying,
    lifetime_days integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by_user_id integer
);


ALTER TABLE public.feature_types OWNER TO unleash_user;

--
-- Name: features; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.features (
    created_at timestamp with time zone DEFAULT now(),
    name character varying(255) NOT NULL,
    description text,
    variants json DEFAULT '[]'::json,
    type character varying DEFAULT 'release'::character varying,
    stale boolean DEFAULT false,
    project character varying DEFAULT 'default'::character varying,
    last_seen_at timestamp with time zone,
    impression_data boolean DEFAULT false,
    archived_at timestamp with time zone,
    potentially_stale boolean,
    created_by_user_id integer,
    archived boolean DEFAULT false
);


ALTER TABLE public.features OWNER TO unleash_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255),
    username character varying(255),
    email character varying(255),
    image_url text,
    password_hash character varying(255),
    login_attempts integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    seen_at timestamp without time zone,
    settings json,
    permissions json DEFAULT '[]'::json,
    deleted_at timestamp with time zone,
    is_service boolean DEFAULT false,
    created_by_user_id integer,
    is_system boolean DEFAULT false NOT NULL,
    scim_id text,
    scim_external_id text,
    first_seen_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO unleash_user;

--
-- Name: features_view; Type: VIEW; Schema: public; Owner: unleash_user
--

CREATE VIEW public.features_view AS
 SELECT features.name,
    features.description,
    features.type,
    features.project,
    features.stale,
    features.impression_data,
    features.created_at,
    features.archived_at,
    features.last_seen_at,
    feature_environments.last_seen_at AS env_last_seen_at,
    feature_environments.enabled,
    feature_environments.environment,
    feature_environments.variants,
    environments.name AS environment_name,
    environments.type AS environment_type,
    environments.sort_order AS environment_sort_order,
    feature_strategies.id AS strategy_id,
    feature_strategies.strategy_name,
    feature_strategies.parameters,
    feature_strategies.constraints,
    feature_strategies.sort_order,
    fss.segment_id AS segments,
    feature_strategies.title AS strategy_title,
    feature_strategies.disabled AS strategy_disabled,
    feature_strategies.variants AS strategy_variants,
    users.id AS user_id,
    users.name AS user_name,
    users.username AS user_username,
    users.email AS user_email
   FROM (((((public.features
     LEFT JOIN public.feature_environments ON (((feature_environments.feature_name)::text = (features.name)::text)))
     LEFT JOIN public.feature_strategies ON ((((feature_strategies.feature_name)::text = (feature_environments.feature_name)::text) AND ((feature_strategies.environment)::text = (feature_environments.environment)::text))))
     LEFT JOIN public.environments ON (((feature_environments.environment)::text = (environments.name)::text)))
     LEFT JOIN public.feature_strategy_segment fss ON ((fss.feature_strategy_id = feature_strategies.id)))
     LEFT JOIN public.users ON ((users.id = features.created_by_user_id)));


ALTER TABLE public.features_view OWNER TO unleash_user;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feedback (
    id integer NOT NULL,
    category text NOT NULL,
    user_type text,
    difficulty_score integer,
    positive text,
    areas_for_improvement text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.feedback OWNER TO unleash_user;

--
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.feedback_id_seq OWNER TO unleash_user;

--
-- Name: feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;


--
-- Name: flag_trends; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.flag_trends (
    id character varying(255) NOT NULL,
    project character varying(255) NOT NULL,
    total_flags integer NOT NULL,
    stale_flags integer NOT NULL,
    potentially_stale_flags integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    health integer DEFAULT 100,
    time_to_production double precision DEFAULT 0,
    users integer DEFAULT 0,
    total_yes bigint,
    total_no bigint,
    total_apps integer,
    total_environments integer
);


ALTER TABLE public.flag_trends OWNER TO unleash_user;

--
-- Name: group_role; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.group_role (
    group_id integer NOT NULL,
    role_id integer NOT NULL,
    created_by text,
    created_at timestamp with time zone DEFAULT now(),
    project text NOT NULL
);


ALTER TABLE public.group_role OWNER TO unleash_user;

--
-- Name: group_user; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.group_user (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_user OWNER TO unleash_user;

--
-- Name: groups; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    mappings_sso jsonb DEFAULT '[]'::jsonb,
    root_role_id integer,
    scim_id text,
    scim_external_id text
);


ALTER TABLE public.groups OWNER TO unleash_user;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups_id_seq OWNER TO unleash_user;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: signal_endpoint_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.signal_endpoint_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    name text NOT NULL,
    signal_endpoint_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer
);


ALTER TABLE public.signal_endpoint_tokens OWNER TO unleash_user;

--
-- Name: incoming_webhook_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.incoming_webhook_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.incoming_webhook_tokens_id_seq OWNER TO unleash_user;

--
-- Name: incoming_webhook_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.incoming_webhook_tokens_id_seq OWNED BY public.signal_endpoint_tokens.id;


--
-- Name: signal_endpoints; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.signal_endpoints (
    id integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer,
    description text
);


ALTER TABLE public.signal_endpoints OWNER TO unleash_user;

--
-- Name: incoming_webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.incoming_webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.incoming_webhooks_id_seq OWNER TO unleash_user;

--
-- Name: incoming_webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.incoming_webhooks_id_seq OWNED BY public.signal_endpoints.id;


--
-- Name: integration_events; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.integration_events (
    id bigint NOT NULL,
    integration_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    state text NOT NULL,
    state_details text NOT NULL,
    event jsonb NOT NULL,
    details jsonb NOT NULL
);


ALTER TABLE public.integration_events OWNER TO unleash_user;

--
-- Name: integration_events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.integration_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integration_events_id_seq OWNER TO unleash_user;

--
-- Name: integration_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.integration_events_id_seq OWNED BY public.integration_events.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.jobs (
    name text NOT NULL,
    bucket timestamp with time zone NOT NULL,
    stage text NOT NULL,
    finished_at timestamp with time zone
);


ALTER TABLE public.jobs OWNER TO unleash_user;

--
-- Name: last_seen_at_metrics; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.last_seen_at_metrics (
    feature_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    last_seen_at timestamp with time zone NOT NULL
);


ALTER TABLE public.last_seen_at_metrics OWNER TO unleash_user;

--
-- Name: login_history; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.login_history (
    id integer NOT NULL,
    username text NOT NULL,
    auth_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    successful boolean NOT NULL,
    ip inet,
    failure_reason text
);


ALTER TABLE public.login_history OWNER TO unleash_user;

--
-- Name: login_events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.login_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.login_events_id_seq OWNER TO unleash_user;

--
-- Name: login_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.login_events_id_seq OWNED BY public.login_history.id;


--
-- Name: message_banners_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.message_banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.message_banners_id_seq OWNER TO unleash_user;

--
-- Name: message_banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.message_banners_id_seq OWNED BY public.banners.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.migrations OWNER TO unleash_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO unleash_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    event_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO unleash_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO unleash_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: signals; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.signals (
    id integer NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    source text NOT NULL,
    source_id integer NOT NULL,
    created_by_source_token_id integer,
    announced boolean DEFAULT false NOT NULL
);


ALTER TABLE public.signals OWNER TO unleash_user;

--
-- Name: observable_events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.observable_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.observable_events_id_seq OWNER TO unleash_user;

--
-- Name: observable_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.observable_events_id_seq OWNED BY public.signals.id;


--
-- Name: onboarding_events_instance; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.onboarding_events_instance (
    event character varying(255) NOT NULL,
    time_to_event integer NOT NULL
);


ALTER TABLE public.onboarding_events_instance OWNER TO unleash_user;

--
-- Name: onboarding_events_project; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.onboarding_events_project (
    event character varying(255) NOT NULL,
    time_to_event integer NOT NULL,
    project character varying(255) NOT NULL
);


ALTER TABLE public.onboarding_events_project OWNER TO unleash_user;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    permission character varying(255) NOT NULL,
    display_name text,
    type character varying(255),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.permissions OWNER TO unleash_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO unleash_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.personal_access_tokens (
    secret text NOT NULL,
    description text,
    user_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    seen_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.personal_access_tokens OWNER TO unleash_user;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.personal_access_tokens_id_seq OWNER TO unleash_user;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: project_client_metrics_trends; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_client_metrics_trends (
    project character varying NOT NULL,
    date date NOT NULL,
    total_yes integer NOT NULL,
    total_no integer NOT NULL,
    total_apps integer NOT NULL,
    total_flags integer NOT NULL,
    total_environments integer NOT NULL
);


ALTER TABLE public.project_client_metrics_trends OWNER TO unleash_user;

--
-- Name: project_environments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_environments (
    project_id character varying(255) NOT NULL,
    environment_name character varying(100) NOT NULL,
    default_strategy jsonb
);


ALTER TABLE public.project_environments OWNER TO unleash_user;

--
-- Name: project_settings; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_settings (
    project character varying(255) NOT NULL,
    default_stickiness character varying(100),
    project_mode character varying(100) DEFAULT 'open'::character varying NOT NULL,
    feature_limit integer,
    feature_naming_pattern text,
    feature_naming_example text,
    feature_naming_description text,
    CONSTRAINT project_settings_project_mode_values CHECK (((project_mode)::text = ANY ((ARRAY['open'::character varying, 'protected'::character varying, 'private'::character varying])::text[])))
);


ALTER TABLE public.project_settings OWNER TO unleash_user;

--
-- Name: project_stats; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_stats (
    project character varying(255) NOT NULL,
    avg_time_to_prod_current_window double precision DEFAULT 0,
    project_changes_current_window integer DEFAULT 0,
    project_changes_past_window integer DEFAULT 0,
    features_created_current_window integer DEFAULT 0,
    features_created_past_window integer DEFAULT 0,
    features_archived_current_window integer DEFAULT 0,
    features_archived_past_window integer DEFAULT 0,
    project_members_added_current_window integer DEFAULT 0
);


ALTER TABLE public.project_stats OWNER TO unleash_user;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.projects (
    id character varying(255) NOT NULL,
    name character varying NOT NULL,
    description character varying,
    created_at timestamp without time zone DEFAULT now(),
    health integer DEFAULT 100,
    updated_at timestamp with time zone DEFAULT now(),
    archived_at timestamp with time zone
);


ALTER TABLE public.projects OWNER TO unleash_user;

--
-- Name: public_signup_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.public_signup_tokens (
    secret text NOT NULL,
    name text,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    role_id integer NOT NULL,
    url text,
    enabled boolean DEFAULT true
);


ALTER TABLE public.public_signup_tokens OWNER TO unleash_user;

--
-- Name: public_signup_tokens_user; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.public_signup_tokens_user (
    secret text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.public_signup_tokens_user OWNER TO unleash_user;

--
-- Name: reset_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.reset_tokens (
    reset_token text NOT NULL,
    user_id integer,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    created_by text
);


ALTER TABLE public.reset_tokens OWNER TO unleash_user;

--
-- Name: role_permission; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.role_permission (
    role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    environment character varying(100),
    permission text,
    created_by_user_id integer,
    id integer NOT NULL
);


ALTER TABLE public.role_permission OWNER TO unleash_user;

--
-- Name: role_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.role_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_permission_id_seq OWNER TO unleash_user;

--
-- Name: role_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.role_permission_id_seq OWNED BY public.role_permission.id;


--
-- Name: role_user; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.role_user (
    role_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    project character varying(255) NOT NULL,
    created_by_user_id integer
);


ALTER TABLE public.role_user OWNER TO unleash_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text DEFAULT 'custom'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    created_by_user_id integer
);


ALTER TABLE public.roles OWNER TO unleash_user;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO unleash_user;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: segments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.segments (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    constraints jsonb DEFAULT '[]'::jsonb NOT NULL,
    segment_project_id character varying(255)
);


ALTER TABLE public.segments OWNER TO unleash_user;

--
-- Name: segments_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.segments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.segments_id_seq OWNER TO unleash_user;

--
-- Name: segments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.segments_id_seq OWNED BY public.segments.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.settings (
    name character varying(255) NOT NULL,
    content json
);


ALTER TABLE public.settings OWNER TO unleash_user;

--
-- Name: stat_environment_updates; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.stat_environment_updates (
    day date NOT NULL,
    environment text NOT NULL,
    updates bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.stat_environment_updates OWNER TO unleash_user;

--
-- Name: stat_traffic_usage; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.stat_traffic_usage (
    day date NOT NULL,
    traffic_group text NOT NULL,
    status_code_series integer NOT NULL,
    count bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.stat_traffic_usage OWNER TO unleash_user;

--
-- Name: strategies; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.strategies (
    created_at timestamp with time zone DEFAULT now(),
    name character varying(255) NOT NULL,
    description text,
    parameters json,
    built_in integer DEFAULT 0,
    deprecated boolean DEFAULT false,
    sort_order integer DEFAULT 9999,
    display_name text,
    title text
);


ALTER TABLE public.strategies OWNER TO unleash_user;

--
-- Name: tag_types; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.tag_types (
    name text NOT NULL,
    description text,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tag_types OWNER TO unleash_user;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.tags (
    type text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tags OWNER TO unleash_user;

--
-- Name: unleash_session; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.unleash_session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expired timestamp with time zone NOT NULL
);


ALTER TABLE public.unleash_session OWNER TO unleash_user;

--
-- Name: used_passwords; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.used_passwords (
    user_id integer NOT NULL,
    password_hash text NOT NULL,
    used_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text)
);


ALTER TABLE public.used_passwords OWNER TO unleash_user;

--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.user_feedback (
    user_id integer NOT NULL,
    feedback_id text NOT NULL,
    given timestamp with time zone,
    nevershow boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_feedback OWNER TO unleash_user;

--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.user_notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    read_at timestamp with time zone
);


ALTER TABLE public.user_notifications OWNER TO unleash_user;

--
-- Name: user_splash; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.user_splash (
    user_id integer NOT NULL,
    splash_id text NOT NULL,
    seen boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_splash OWNER TO unleash_user;

--
-- Name: user_trends; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.user_trends (
    id character varying(255) NOT NULL,
    total_users integer NOT NULL,
    active_users integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_trends OWNER TO unleash_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO unleash_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: action_set_events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_set_events ALTER COLUMN id SET DEFAULT nextval('public.action_set_events_id_seq'::regclass);


--
-- Name: action_sets id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_sets ALTER COLUMN id SET DEFAULT nextval('public.action_sets_id_seq'::regclass);


--
-- Name: actions id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.actions ALTER COLUMN id SET DEFAULT nextval('public.actions_id_seq'::regclass);


--
-- Name: addons id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.addons ALTER COLUMN id SET DEFAULT nextval('public.addons_id_seq'::regclass);


--
-- Name: ai_chats id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.ai_chats ALTER COLUMN id SET DEFAULT nextval('public.ai_chats_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.message_banners_id_seq'::regclass);


--
-- Name: change_request_approvals id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals ALTER COLUMN id SET DEFAULT nextval('public.change_request_approvals_id_seq'::regclass);


--
-- Name: change_request_comments id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_comments ALTER COLUMN id SET DEFAULT nextval('public.change_request_comments_id_seq'::regclass);


--
-- Name: change_request_events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events ALTER COLUMN id SET DEFAULT nextval('public.change_request_events_id_seq'::regclass);


--
-- Name: change_request_rejections id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections ALTER COLUMN id SET DEFAULT nextval('public.change_request_rejections_id_seq'::regclass);


--
-- Name: change_requests id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests ALTER COLUMN id SET DEFAULT nextval('public.change_requests_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: integration_events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.integration_events ALTER COLUMN id SET DEFAULT nextval('public.integration_events_id_seq'::regclass);


--
-- Name: login_history id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.login_history ALTER COLUMN id SET DEFAULT nextval('public.login_events_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: role_permission id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_permission ALTER COLUMN id SET DEFAULT nextval('public.role_permission_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: segments id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.segments ALTER COLUMN id SET DEFAULT nextval('public.segments_id_seq'::regclass);


--
-- Name: signal_endpoint_tokens id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoint_tokens ALTER COLUMN id SET DEFAULT nextval('public.incoming_webhook_tokens_id_seq'::regclass);


--
-- Name: signal_endpoints id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoints ALTER COLUMN id SET DEFAULT nextval('public.incoming_webhooks_id_seq'::regclass);


--
-- Name: signals id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signals ALTER COLUMN id SET DEFAULT nextval('public.observable_events_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: action_set_events action_set_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_set_events
    ADD CONSTRAINT action_set_events_pkey PRIMARY KEY (id);


--
-- Name: action_sets action_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_sets
    ADD CONSTRAINT action_sets_pkey PRIMARY KEY (id);


--
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (id);


--
-- Name: addons addons_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.addons
    ADD CONSTRAINT addons_pkey PRIMARY KEY (id);


--
-- Name: ai_chats ai_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.ai_chats
    ADD CONSTRAINT ai_chats_pkey PRIMARY KEY (id);


--
-- Name: api_token_project api_token_project_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_token_project
    ADD CONSTRAINT api_token_project_pkey PRIMARY KEY (secret, project);


--
-- Name: api_tokens api_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_pkey PRIMARY KEY (secret);


--
-- Name: change_request_approvals change_request_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals
    ADD CONSTRAINT change_request_approvals_pkey PRIMARY KEY (id);


--
-- Name: change_request_comments change_request_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_comments
    ADD CONSTRAINT change_request_comments_pkey PRIMARY KEY (id);


--
-- Name: change_request_events change_request_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events
    ADD CONSTRAINT change_request_events_pkey PRIMARY KEY (id);


--
-- Name: change_request_rejections change_request_rejections_change_request_id_created_by_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections
    ADD CONSTRAINT change_request_rejections_change_request_id_created_by_key UNIQUE (change_request_id, created_by);


--
-- Name: change_request_rejections change_request_rejections_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections
    ADD CONSTRAINT change_request_rejections_pkey PRIMARY KEY (id);


--
-- Name: change_request_schedule change_request_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_schedule
    ADD CONSTRAINT change_request_schedule_pkey PRIMARY KEY (change_request);


--
-- Name: change_request_settings change_request_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_settings
    ADD CONSTRAINT change_request_settings_pkey PRIMARY KEY (project, environment);


--
-- Name: change_request_settings change_request_settings_project_environment_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_settings
    ADD CONSTRAINT change_request_settings_project_environment_key UNIQUE (project, environment);


--
-- Name: change_requests change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_pkey PRIMARY KEY (id);


--
-- Name: client_applications client_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_applications
    ADD CONSTRAINT client_applications_pkey PRIMARY KEY (app_name);


--
-- Name: client_applications_usage client_applications_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_applications_usage
    ADD CONSTRAINT client_applications_usage_pkey PRIMARY KEY (app_name, project, environment);


--
-- Name: client_instances client_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_instances
    ADD CONSTRAINT client_instances_pkey PRIMARY KEY (app_name, environment, instance_id);


--
-- Name: client_metrics_env_daily client_metrics_env_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_daily
    ADD CONSTRAINT client_metrics_env_daily_pkey PRIMARY KEY (feature_name, app_name, environment, date);


--
-- Name: client_metrics_env client_metrics_env_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env
    ADD CONSTRAINT client_metrics_env_pkey PRIMARY KEY (feature_name, app_name, environment, "timestamp");


--
-- Name: client_metrics_env_variants_daily client_metrics_env_variants_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_variants_daily
    ADD CONSTRAINT client_metrics_env_variants_daily_pkey PRIMARY KEY (feature_name, app_name, environment, date, variant);


--
-- Name: client_metrics_env_variants client_metrics_env_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_variants
    ADD CONSTRAINT client_metrics_env_variants_pkey PRIMARY KEY (feature_name, app_name, environment, "timestamp", variant);


--
-- Name: context_fields context_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.context_fields
    ADD CONSTRAINT context_fields_pkey PRIMARY KEY (name);


--
-- Name: dependent_features dependent_features_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.dependent_features
    ADD CONSTRAINT dependent_features_pkey PRIMARY KEY (parent, child);


--
-- Name: environment_type_trends environment_type_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.environment_type_trends
    ADD CONSTRAINT environment_type_trends_pkey PRIMARY KEY (id, environment_type);


--
-- Name: environments environments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.environments
    ADD CONSTRAINT environments_pkey PRIMARY KEY (name);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: favorite_features favorite_features_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_features
    ADD CONSTRAINT favorite_features_pkey PRIMARY KEY (feature, user_id);


--
-- Name: favorite_projects favorite_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_projects
    ADD CONSTRAINT favorite_projects_pkey PRIMARY KEY (project, user_id);


--
-- Name: feature_environments feature_environments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_environments
    ADD CONSTRAINT feature_environments_pkey PRIMARY KEY (environment, feature_name);


--
-- Name: feature_lifecycles feature_lifecycles_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_lifecycles
    ADD CONSTRAINT feature_lifecycles_pkey PRIMARY KEY (feature, stage);


--
-- Name: feature_strategies feature_strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategies
    ADD CONSTRAINT feature_strategies_pkey PRIMARY KEY (id);


--
-- Name: feature_strategy_segment feature_strategy_segment_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategy_segment
    ADD CONSTRAINT feature_strategy_segment_pkey PRIMARY KEY (feature_strategy_id, segment_id);


--
-- Name: feature_tag feature_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_tag
    ADD CONSTRAINT feature_tag_pkey PRIMARY KEY (feature_name, tag_type, tag_value);


--
-- Name: feature_types feature_types_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_types
    ADD CONSTRAINT feature_types_pkey PRIMARY KEY (id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (name);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: flag_trends flag_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.flag_trends
    ADD CONSTRAINT flag_trends_pkey PRIMARY KEY (id, project);


--
-- Name: group_role group_role_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_role
    ADD CONSTRAINT group_role_pkey PRIMARY KEY (group_id, role_id, project);


--
-- Name: group_user group_user_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_pkey PRIMARY KEY (group_id, user_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: signal_endpoint_tokens incoming_webhook_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoint_tokens
    ADD CONSTRAINT incoming_webhook_tokens_pkey PRIMARY KEY (id);


--
-- Name: signal_endpoints incoming_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoints
    ADD CONSTRAINT incoming_webhooks_pkey PRIMARY KEY (id);


--
-- Name: integration_events integration_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (name, bucket);


--
-- Name: last_seen_at_metrics last_seen_at_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.last_seen_at_metrics
    ADD CONSTRAINT last_seen_at_metrics_pkey PRIMARY KEY (feature_name, environment);


--
-- Name: login_history login_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_events_pkey PRIMARY KEY (id);


--
-- Name: banners message_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT message_banners_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: signals observable_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signals
    ADD CONSTRAINT observable_events_pkey PRIMARY KEY (id);


--
-- Name: onboarding_events_instance onboarding_events_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.onboarding_events_instance
    ADD CONSTRAINT onboarding_events_instance_pkey PRIMARY KEY (event);


--
-- Name: onboarding_events_project onboarding_events_project_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.onboarding_events_project
    ADD CONSTRAINT onboarding_events_project_pkey PRIMARY KEY (event, project);


--
-- Name: permissions permission_unique; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permission_unique UNIQUE (permission);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: project_client_metrics_trends project_client_metrics_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_client_metrics_trends
    ADD CONSTRAINT project_client_metrics_trends_pkey PRIMARY KEY (project, date);


--
-- Name: project_environments project_environments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_environments
    ADD CONSTRAINT project_environments_pkey PRIMARY KEY (project_id, environment_name);


--
-- Name: project_settings project_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_settings
    ADD CONSTRAINT project_settings_pkey PRIMARY KEY (project);


--
-- Name: project_stats project_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_stats
    ADD CONSTRAINT project_stats_pkey PRIMARY KEY (project);


--
-- Name: project_stats project_stats_project_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_stats
    ADD CONSTRAINT project_stats_project_key UNIQUE (project);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: public_signup_tokens public_signup_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens
    ADD CONSTRAINT public_signup_tokens_pkey PRIMARY KEY (secret);


--
-- Name: public_signup_tokens_user public_signup_tokens_user_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens_user
    ADD CONSTRAINT public_signup_tokens_user_pkey PRIMARY KEY (secret, user_id);


--
-- Name: reset_tokens reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.reset_tokens
    ADD CONSTRAINT reset_tokens_pkey PRIMARY KEY (reset_token);


--
-- Name: role_permission role_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (id);


--
-- Name: role_user role_user_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_pkey PRIMARY KEY (role_id, user_id, project);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: segments segments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.segments
    ADD CONSTRAINT segments_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (name);


--
-- Name: stat_environment_updates stat_environment_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.stat_environment_updates
    ADD CONSTRAINT stat_environment_updates_pkey PRIMARY KEY (day, environment);


--
-- Name: stat_traffic_usage stat_traffic_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.stat_traffic_usage
    ADD CONSTRAINT stat_traffic_usage_pkey PRIMARY KEY (day, traffic_group, status_code_series);


--
-- Name: strategies strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.strategies
    ADD CONSTRAINT strategies_pkey PRIMARY KEY (name);


--
-- Name: tag_types tag_types_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.tag_types
    ADD CONSTRAINT tag_types_pkey PRIMARY KEY (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (type, value);


--
-- Name: change_request_approvals unique_approvals; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals
    ADD CONSTRAINT unique_approvals UNIQUE (change_request_id, created_by);


--
-- Name: roles unique_name; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT unique_name UNIQUE (name);


--
-- Name: unleash_session unleash_session_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.unleash_session
    ADD CONSTRAINT unleash_session_pkey PRIMARY KEY (sid);


--
-- Name: used_passwords used_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.used_passwords
    ADD CONSTRAINT used_passwords_pkey PRIMARY KEY (user_id, password_hash);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (user_id, feedback_id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (notification_id, user_id);


--
-- Name: user_splash user_splash_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_splash
    ADD CONSTRAINT user_splash_pkey PRIMARY KEY (user_id, splash_id);


--
-- Name: user_trends user_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_trends
    ADD CONSTRAINT user_trends_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: client_instances_environment_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX client_instances_environment_idx ON public.client_instances USING btree (environment);


--
-- Name: events_created_by_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX events_created_by_user_id_idx ON public.events USING btree (created_by_user_id);


--
-- Name: events_environment_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX events_environment_idx ON public.events USING btree (environment);


--
-- Name: events_project_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX events_project_idx ON public.events USING btree (project);


--
-- Name: events_unannounced_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX events_unannounced_idx ON public.events USING btree (announced) WHERE (announced = false);


--
-- Name: feature_environments_feature_name_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_environments_feature_name_idx ON public.feature_environments USING btree (feature_name);


--
-- Name: feature_name_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_name_idx ON public.events USING btree (feature_name);


--
-- Name: feature_strategies_environment_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_strategies_environment_idx ON public.feature_strategies USING btree (environment);


--
-- Name: feature_strategies_feature_name_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_strategies_feature_name_idx ON public.feature_strategies USING btree (feature_name);


--
-- Name: feature_strategy_segment_segment_id_index; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_strategy_segment_segment_id_index ON public.feature_strategy_segment USING btree (segment_id);


--
-- Name: feature_tag_tag_type_and_value_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_tag_tag_type_and_value_idx ON public.feature_tag USING btree (tag_type, tag_value);


--
-- Name: groups_group_name_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX groups_group_name_idx ON public.groups USING btree (name);


--
-- Name: groups_scim_external_id_uniq_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE UNIQUE INDEX groups_scim_external_id_uniq_idx ON public.groups USING btree (scim_external_id) WHERE (scim_external_id IS NOT NULL);


--
-- Name: groups_scim_id_unique_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE UNIQUE INDEX groups_scim_id_unique_idx ON public.groups USING btree (scim_id) WHERE (scim_id IS NOT NULL);


--
-- Name: idx_action_set_events_action_set_id_state; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_action_set_events_action_set_id_state ON public.action_set_events USING btree (action_set_id, state);


--
-- Name: idx_action_set_events_signal_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_action_set_events_signal_id ON public.action_set_events USING btree (signal_id);


--
-- Name: idx_action_sets_project; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_action_sets_project ON public.action_sets USING btree (project);


--
-- Name: idx_ai_chats_user_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_ai_chats_user_id ON public.ai_chats USING btree (user_id);


--
-- Name: idx_client_applications_announced_false; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_client_applications_announced_false ON public.client_applications USING btree (announced) WHERE (announced = false);


--
-- Name: idx_client_metrics_f_name; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_client_metrics_f_name ON public.client_metrics_env USING btree (feature_name);


--
-- Name: idx_events_created_at_desc; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_events_created_at_desc ON public.events USING btree (created_at DESC);


--
-- Name: idx_events_feature_type_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_events_feature_type_id ON public.events USING btree (id) WHERE ((feature_name IS NOT NULL) OR ((type)::text = ANY ((ARRAY['segment-updated'::character varying, 'feature_import'::character varying, 'features-imported'::character varying])::text[])));


--
-- Name: idx_events_type; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_events_type ON public.events USING btree (type);


--
-- Name: idx_feature_name; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_feature_name ON public.last_seen_at_metrics USING btree (feature_name);


--
-- Name: idx_integration_events_integration_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_integration_events_integration_id ON public.integration_events USING btree (integration_id);


--
-- Name: idx_job_finished; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_job_finished ON public.jobs USING btree (finished_at);


--
-- Name: idx_job_stage; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_job_stage ON public.jobs USING btree (stage);


--
-- Name: idx_signal_endpoint_tokens_signal_endpoint_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signal_endpoint_tokens_signal_endpoint_id ON public.signal_endpoint_tokens USING btree (signal_endpoint_id);


--
-- Name: idx_signal_endpoints_enabled; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signal_endpoints_enabled ON public.signal_endpoints USING btree (enabled);


--
-- Name: idx_signals_created_by_source_token_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signals_created_by_source_token_id ON public.signals USING btree (created_by_source_token_id);


--
-- Name: idx_signals_source_and_source_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signals_source_and_source_id ON public.signals USING btree (source, source_id);


--
-- Name: idx_signals_unannounced; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signals_unannounced ON public.signals USING btree (announced) WHERE (announced = false);


--
-- Name: idx_unleash_session_expired; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_unleash_session_expired ON public.unleash_session USING btree (expired);


--
-- Name: login_events_ip_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX login_events_ip_idx ON public.login_history USING btree (ip);


--
-- Name: project_environments_environment_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX project_environments_environment_idx ON public.project_environments USING btree (environment_name);


--
-- Name: reset_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX reset_tokens_user_id_idx ON public.reset_tokens USING btree (user_id);


--
-- Name: role_permission_role_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX role_permission_role_id_idx ON public.role_permission USING btree (role_id);


--
-- Name: role_user_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX role_user_user_id_idx ON public.role_user USING btree (user_id);


--
-- Name: segments_name_index; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX segments_name_index ON public.segments USING btree (name);


--
-- Name: stat_traffic_usage_day_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX stat_traffic_usage_day_idx ON public.stat_traffic_usage USING btree (day);


--
-- Name: stat_traffic_usage_status_code_series_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX stat_traffic_usage_status_code_series_idx ON public.stat_traffic_usage USING btree (status_code_series);


--
-- Name: stat_traffic_usage_traffic_group_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX stat_traffic_usage_traffic_group_idx ON public.stat_traffic_usage USING btree (traffic_group);


--
-- Name: used_passwords_pw_hash_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX used_passwords_pw_hash_idx ON public.used_passwords USING btree (password_hash);


--
-- Name: user_feedback_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX user_feedback_user_id_idx ON public.user_feedback USING btree (user_id);


--
-- Name: user_splash_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX user_splash_user_id_idx ON public.user_splash USING btree (user_id);


--
-- Name: users_scim_external_id_uniq_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE UNIQUE INDEX users_scim_external_id_uniq_idx ON public.users USING btree (scim_external_id) WHERE (scim_external_id IS NOT NULL);


--
-- Name: users_scim_id_unique_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE UNIQUE INDEX users_scim_id_unique_idx ON public.users USING btree (scim_id) WHERE (scim_id IS NOT NULL);


--
-- Name: events unleash_update_stat_environment_changes; Type: TRIGGER; Schema: public; Owner: unleash_user
--

CREATE TRIGGER unleash_update_stat_environment_changes AFTER INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.unleash_update_stat_environment_changes_counter();


--
-- Name: action_sets action_sets_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_sets
    ADD CONSTRAINT action_sets_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: actions actions_action_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_action_set_id_fkey FOREIGN KEY (action_set_id) REFERENCES public.action_sets(id) ON DELETE CASCADE;


--
-- Name: ai_chats ai_chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.ai_chats
    ADD CONSTRAINT ai_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_token_project api_token_project_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_token_project
    ADD CONSTRAINT api_token_project_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: api_token_project api_token_project_secret_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_token_project
    ADD CONSTRAINT api_token_project_secret_fkey FOREIGN KEY (secret) REFERENCES public.api_tokens(secret) ON DELETE CASCADE;


--
-- Name: change_request_approvals change_request_approvals_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals
    ADD CONSTRAINT change_request_approvals_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_approvals change_request_approvals_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals
    ADD CONSTRAINT change_request_approvals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_request_comments change_request_comments_change_request_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_comments
    ADD CONSTRAINT change_request_comments_change_request_fkey FOREIGN KEY (change_request) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_comments change_request_comments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_comments
    ADD CONSTRAINT change_request_comments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_request_events change_request_events_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events
    ADD CONSTRAINT change_request_events_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_events change_request_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events
    ADD CONSTRAINT change_request_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_request_events change_request_events_feature_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events
    ADD CONSTRAINT change_request_events_feature_fkey FOREIGN KEY (feature) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: change_request_rejections change_request_rejections_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections
    ADD CONSTRAINT change_request_rejections_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_rejections change_request_rejections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections
    ADD CONSTRAINT change_request_rejections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_request_schedule change_request_schedule_change_request_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_schedule
    ADD CONSTRAINT change_request_schedule_change_request_fkey FOREIGN KEY (change_request) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_schedule change_request_schedule_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_schedule
    ADD CONSTRAINT change_request_schedule_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: change_request_settings change_request_settings_environment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_settings
    ADD CONSTRAINT change_request_settings_environment_fkey FOREIGN KEY (environment) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: change_request_settings change_request_settings_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_settings
    ADD CONSTRAINT change_request_settings_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: change_requests change_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_requests change_requests_environment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_environment_fkey FOREIGN KEY (environment) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: change_requests change_requests_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: client_applications_usage client_applications_usage_app_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_applications_usage
    ADD CONSTRAINT client_applications_usage_app_name_fkey FOREIGN KEY (app_name) REFERENCES public.client_applications(app_name) ON DELETE CASCADE;


--
-- Name: client_metrics_env_variants_daily client_metrics_env_variants_d_feature_name_app_name_enviro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_variants_daily
    ADD CONSTRAINT client_metrics_env_variants_d_feature_name_app_name_enviro_fkey FOREIGN KEY (feature_name, app_name, environment, date) REFERENCES public.client_metrics_env_daily(feature_name, app_name, environment, date) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: client_metrics_env_variants client_metrics_env_variants_feature_name_app_name_environm_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_variants
    ADD CONSTRAINT client_metrics_env_variants_feature_name_app_name_environm_fkey FOREIGN KEY (feature_name, app_name, environment, "timestamp") REFERENCES public.client_metrics_env(feature_name, app_name, environment, "timestamp") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dependent_features dependent_features_child_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.dependent_features
    ADD CONSTRAINT dependent_features_child_fkey FOREIGN KEY (child) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: dependent_features dependent_features_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.dependent_features
    ADD CONSTRAINT dependent_features_parent_fkey FOREIGN KEY (parent) REFERENCES public.features(name) ON DELETE RESTRICT;


--
-- Name: favorite_features favorite_features_feature_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_features
    ADD CONSTRAINT favorite_features_feature_fkey FOREIGN KEY (feature) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: favorite_features favorite_features_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_features
    ADD CONSTRAINT favorite_features_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: favorite_projects favorite_projects_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_projects
    ADD CONSTRAINT favorite_projects_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: favorite_projects favorite_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_projects
    ADD CONSTRAINT favorite_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: feature_environments feature_environments_environment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_environments
    ADD CONSTRAINT feature_environments_environment_fkey FOREIGN KEY (environment) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: feature_environments feature_environments_feature_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_environments
    ADD CONSTRAINT feature_environments_feature_name_fkey FOREIGN KEY (feature_name) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: feature_lifecycles feature_lifecycles_feature_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_lifecycles
    ADD CONSTRAINT feature_lifecycles_feature_fkey FOREIGN KEY (feature) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: feature_strategies feature_strategies_environment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategies
    ADD CONSTRAINT feature_strategies_environment_fkey FOREIGN KEY (environment) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: feature_strategies feature_strategies_feature_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategies
    ADD CONSTRAINT feature_strategies_feature_name_fkey FOREIGN KEY (feature_name) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: feature_strategy_segment feature_strategy_segment_feature_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategy_segment
    ADD CONSTRAINT feature_strategy_segment_feature_strategy_id_fkey FOREIGN KEY (feature_strategy_id) REFERENCES public.feature_strategies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feature_strategy_segment feature_strategy_segment_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategy_segment
    ADD CONSTRAINT feature_strategy_segment_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feature_tag feature_tag_feature_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_tag
    ADD CONSTRAINT feature_tag_feature_name_fkey FOREIGN KEY (feature_name) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: feature_tag feature_tag_tag_type_tag_value_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_tag
    ADD CONSTRAINT feature_tag_tag_type_tag_value_fkey FOREIGN KEY (tag_type, tag_value) REFERENCES public.tags(type, value) ON DELETE CASCADE;


--
-- Name: groups fk_group_role_id; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT fk_group_role_id FOREIGN KEY (root_role_id) REFERENCES public.roles(id);


--
-- Name: group_role fk_group_role_project; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_role
    ADD CONSTRAINT fk_group_role_project FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: role_permission fk_role_permission_permission; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission) REFERENCES public.permissions(permission) ON DELETE CASCADE;


--
-- Name: group_role group_role_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_role
    ADD CONSTRAINT group_role_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_role group_role_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_role
    ADD CONSTRAINT group_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: group_user group_user_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_user group_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: signal_endpoint_tokens incoming_webhook_tokens_incoming_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoint_tokens
    ADD CONSTRAINT incoming_webhook_tokens_incoming_webhook_id_fkey FOREIGN KEY (signal_endpoint_id) REFERENCES public.signal_endpoints(id) ON DELETE CASCADE;


--
-- Name: integration_events integration_events_integration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES public.addons(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: onboarding_events_project onboarding_events_project_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.onboarding_events_project
    ADD CONSTRAINT onboarding_events_project_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: personal_access_tokens personal_access_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_environments project_environments_environment_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_environments
    ADD CONSTRAINT project_environments_environment_name_fkey FOREIGN KEY (environment_name) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: project_environments project_environments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_environments
    ADD CONSTRAINT project_environments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_settings project_settings_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_settings
    ADD CONSTRAINT project_settings_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_stats project_stats_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_stats
    ADD CONSTRAINT project_stats_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: public_signup_tokens public_signup_tokens_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens
    ADD CONSTRAINT public_signup_tokens_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: public_signup_tokens_user public_signup_tokens_user_secret_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens_user
    ADD CONSTRAINT public_signup_tokens_user_secret_fkey FOREIGN KEY (secret) REFERENCES public.public_signup_tokens(secret) ON DELETE CASCADE;


--
-- Name: public_signup_tokens_user public_signup_tokens_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens_user
    ADD CONSTRAINT public_signup_tokens_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reset_tokens reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.reset_tokens
    ADD CONSTRAINT reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_permission role_permission_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: role_user role_user_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: role_user role_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: segments segments_segment_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.segments
    ADD CONSTRAINT segments_segment_project_id_fkey FOREIGN KEY (segment_project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: tags tags_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_type_fkey FOREIGN KEY (type) REFERENCES public.tag_types(name) ON DELETE CASCADE;


--
-- Name: used_passwords used_passwords_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.used_passwords
    ADD CONSTRAINT used_passwords_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_splash user_splash_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_splash
    ADD CONSTRAINT user_splash_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

